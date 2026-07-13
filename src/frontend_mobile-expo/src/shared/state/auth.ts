/**
 * Auth store cho app mobile — dùng backend thật (/api/mobile/auth/*).
 *
 * Token JWT lưu an toàn qua expo-secure-store (client.ts). Vai trò (role)
 * do backend trả về theo tài khoản: "driver" | "gate_manager". App route
 * theo role sau khi đăng nhập.
 *
 * Giữ pattern subscribe/snapshot (không cần Provider bọc ngoài).
 */
import { useEffect, useState } from "react";
import {
  setAuthToken,
  clearAuthToken,
  getAuthToken,
} from "@/shared/api/client";
import {
  loginRequest,
  fetchMe,
  logoutRequest,
} from "@/shared/api/mobile-api";
import type { MobileRole } from "@/shared/types";

export type MobileUser = {
  id: string;
  fullName: string;
  email?: string;
  [key: string]: unknown;
};

type AuthSnapshot = {
  isReady: boolean;
  isAuthenticated: boolean;
  role: MobileRole | null;
  user: MobileUser | null;
};

let authState: AuthSnapshot = {
  isReady: false,
  isAuthenticated: false,
  role: null,
  user: null,
};

const subscribers = new Set<(state: AuthSnapshot) => void>();
let hydrateStarted = false;

function notify() {
  subscribers.forEach((subscriber) => {
    try {
      subscriber(authState);
    } catch {
      // ignore subscriber failures
    }
  });
}

function commit(next: AuthSnapshot) {
  authState = next;
  notify();
}

async function hydrateAuthState() {
  if (hydrateStarted) return;
  hydrateStarted = true;

  try {
    const token = await getAuthToken();
    if (!token) {
      commit({ ...authState, isReady: true });
      return;
    }

    // Có token -> xác thực lại với backend để lấy role + hồ sơ.
    const me = await fetchMe();
    commit({
      isReady: true,
      isAuthenticated: true,
      role: me.role as MobileRole,
      user: me as unknown as MobileUser,
    });
  } catch {
    // Token hỏng/hết hạn -> dọn sạch.
    await clearAuthToken().catch(() => {});
    commit({
      isReady: true,
      isAuthenticated: false,
      role: null,
      user: null,
    });
  }
}

void hydrateAuthState();

export function useAuth() {
  const [snapshot, setSnapshot] = useState<AuthSnapshot>(authState);

  useEffect(() => {
    void hydrateAuthState();
    const subscriber = (next: AuthSnapshot) => setSnapshot(next);
    subscribers.add(subscriber);
    setSnapshot(authState);
    return () => {
      subscribers.delete(subscriber);
    };
  }, []);

  return snapshot;
}

/** Đăng nhập bằng email + mật khẩu. Backend tự xác định vai trò. */
export async function signIn(email: string, password: string) {
  try {
    const result = await loginRequest(email.trim(), password);
    await setAuthToken(result.token);
    commit({
      isReady: true,
      isAuthenticated: true,
      role: result.role,
      user: result.user as MobileUser,
    });
    return { ok: true as const, role: result.role };
  } catch (err: any) {
    return {
      ok: false as const,
      message: err?.message ?? "Đăng nhập thất bại",
    };
  }
}

/** Đăng xuất: hủy phiên backend + xóa token cục bộ. */
export async function signOut() {
  await logoutRequest();
  await clearAuthToken().catch(() => {});
  commit({
    isReady: true,
    isAuthenticated: false,
    role: null,
    user: null,
  });
}
