import { useEffect } from "react";
import { useRouter } from "expo-router";

import { useAuth } from "@/shared/state/auth";

export default function Index() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isReady) return;
    router.replace(auth.isAuthenticated ? "/(tabs)" : "/login");
  }, [auth.isAuthenticated, auth.isReady, router]);

  return null;
}
