import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export type AuthAccount = {
  username: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  createdAt: string;
};

type AuthSnapshot = {
  isReady: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  currentUsername: string | null;
  accounts: AuthAccount[];
};

export type RegisterAccountInput = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
};

const STORAGE_KEY = "@app:auth_state_v1";

const DEFAULT_ACCOUNT: AuthAccount = {
  username: "driver01",
  fullName: "Nguyen Van An",
  phone: "+84 912 345 678",
  email: "driver01@logiport.vn",
  password: "123456",
  createdAt: new Date().toISOString(),
};

let authState: AuthSnapshot = {
  isReady: false,
  isAuthenticated: false,
  isGuest: false,
  currentUsername: null,
  accounts: [DEFAULT_ACCOUNT],
};

const subscribers = new Set<(state: AuthSnapshot) => void>();
let hydrateStarted = false;

function notify() {
  subscribers.forEach((subscriber) => {
    try {
      subscriber(authState);
    } catch (error) {
      // ignore subscriber failures
    }
  });
}

function persistState(nextState: AuthSnapshot) {
  AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      isAuthenticated: nextState.isAuthenticated,
      isGuest: nextState.isGuest,
      currentUsername: nextState.currentUsername,
      accounts: nextState.accounts,
    }),
  ).catch(() => {});
}

async function hydrateAuthState() {
  if (hydrateStarted) return;
  hydrateStarted = true;

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      authState = { ...authState, isReady: true };
      notify();
      return;
    }

    const parsed = JSON.parse(raw) as Partial<AuthSnapshot>;
    authState = {
      isReady: true,
      isAuthenticated: Boolean(parsed.isAuthenticated),
      isGuest: Boolean(parsed.isGuest),
      currentUsername: parsed.currentUsername ?? null,
      accounts:
        Array.isArray(parsed.accounts) && parsed.accounts.length > 0
          ? parsed.accounts
          : [DEFAULT_ACCOUNT],
    };
  } catch (error) {
    authState = { ...authState, isReady: true };
  }

  notify();
}

void hydrateAuthState();

function commit(nextState: AuthSnapshot) {
  authState = nextState;
  notify();
  persistState(nextState);
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function buildUsername(email: string, accounts: AuthAccount[]) {
  const base =
    normalize(email)
      .split("@")[0]
      .replace(/[^a-z0-9]/g, "") || "driver";
  let candidate = base;
  let counter = 1;

  while (
    accounts.some(
      (account) => account.username.toLowerCase() === candidate.toLowerCase(),
    )
  ) {
    counter += 1;
    candidate = `${base}${counter}`;
  }

  return candidate;
}

export function useAuth() {
  const [snapshot, setSnapshot] = useState<AuthSnapshot>(authState);

  useEffect(() => {
    void hydrateAuthState();
    const subscriber = (nextState: AuthSnapshot) => setSnapshot(nextState);
    subscribers.add(subscriber);
    setSnapshot(authState);

    return () => {
      subscribers.delete(subscriber);
    };
  }, []);

  const currentAccount =
    snapshot.accounts.find(
      (account) => account.username === snapshot.currentUsername,
    ) ?? null;

  return {
    ...snapshot,
    currentAccount,
  };
}

export function signInAsGuest() {
  commit({
    ...authState,
    isAuthenticated: true,
    isGuest: true,
    currentUsername: null,
  });

  return {
    ok: true,
  } as const;
}

export function signIn(identifier: string, password: string) {
  const normalizedIdentifier = normalize(identifier);
  const matchedAccount = authState.accounts.find(
    (account) =>
      account.username.toLowerCase() === normalizedIdentifier ||
      account.email.toLowerCase() === normalizedIdentifier,
  );

  if (!matchedAccount || matchedAccount.password !== password) {
    return {
      ok: false,
      message: "Sai tên đăng nhập hoặc mật khẩu.",
    } as const;
  }

  commit({
    ...authState,
    isAuthenticated: true,
    isGuest: false,
    currentUsername: matchedAccount.username,
  });

  return {
    ok: true,
    account: matchedAccount,
  } as const;
}

export function signOut() {
  commit({
    ...authState,
    isAuthenticated: false,
    isGuest: false,
    currentUsername: null,
  });
}

export function registerAccount(input: RegisterAccountInput) {
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const email = normalize(input.email);

  if (
    authState.accounts.some((account) => account.email.toLowerCase() === email)
  ) {
    return {
      ok: false,
      message: "Email đã được sử dụng.",
    } as const;
  }

  const username = buildUsername(email, authState.accounts);
  const account: AuthAccount = {
    username,
    fullName,
    phone,
    email,
    password: input.password,
    createdAt: new Date().toISOString(),
  };

  commit({
    ...authState,
    accounts: [...authState.accounts, account],
  });

  return {
    ok: true,
    account,
  } as const;
}

export function recoverPassword(identifier: string, nextPassword: string) {
  const normalizedIdentifier = normalize(identifier);
  const index = authState.accounts.findIndex(
    (account) =>
      account.email.toLowerCase() === normalizedIdentifier ||
      account.phone.replace(/\s+/g, "") ===
        normalizedIdentifier.replace(/\s+/g, ""),
  );

  if (index < 0) {
    return {
      ok: false,
      message: "Không tìm thấy tài khoản theo thông tin đã nhập.",
    } as const;
  }

  const updatedAccounts = authState.accounts.map((account, currentIndex) =>
    currentIndex === index
      ? {
          ...account,
          password: nextPassword,
        }
      : account,
  );

  commit({
    ...authState,
    accounts: updatedAccounts,
  });

  return {
    ok: true,
    account: updatedAccounts[index],
  } as const;
}
