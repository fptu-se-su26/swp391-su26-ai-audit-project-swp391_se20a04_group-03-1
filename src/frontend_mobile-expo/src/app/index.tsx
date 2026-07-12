import { useEffect } from "react";
import { useRouter } from "expo-router";

import { useAuth } from "@/shared/state/auth";

// Điểm vào: điều hướng theo trạng thái đăng nhập + vai trò.
export default function Index() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isReady) return;
    if (!auth.isAuthenticated) {
      router.replace("/login");
      return;
    }
    router.replace(auth.role === "gate_manager" ? "/(gate)" : "/(driver)");
  }, [auth.isAuthenticated, auth.isReady, auth.role, router]);

  return null;
}
