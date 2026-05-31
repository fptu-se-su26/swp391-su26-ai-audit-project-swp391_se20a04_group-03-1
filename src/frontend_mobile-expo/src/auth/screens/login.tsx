import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Snackbar } from "@/shared/components/feedback/Snackbar";
import { signIn, signInAsGuest, useAuth } from "@/shared/state/auth";

const isFilled = (value: string) => value.trim().length > 0;

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    authToast?: string;
    username?: string;
  }>();
  const auth = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [registerToastVisible, setRegisterToastVisible] = useState(false);

  const fieldErrors = useMemo(
    () => ({
      username:
        submitted && !isFilled(username) ? "Vui lòng nhập tên đăng nhập." : "",
      password:
        submitted && !isFilled(password) ? "Vui lòng nhập mật khẩu." : "",
    }),
    [password, submitted, username],
  );

  useEffect(() => {
    if (params.authToast === "register-success") {
      setRegisterToastVisible(true);
      const timer = setTimeout(() => setRegisterToastVisible(false), 2800);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [params.authToast]);

  useEffect(() => {
    if (auth.isReady && auth.isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [auth.isAuthenticated, auth.isReady, router]);

  async function handleSubmit() {
    setSubmitted(true);
    setError("");

    if (!isFilled(username) || !isFilled(password)) {
      setError("Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    const result = signIn(username, password);
    if (!result.ok) {
      setError(result.message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({
      pathname: "/(tabs)",
      params: { authToast: "login-success" },
    });
  }

  async function handleGuestAccess() {
    signInAsGuest();
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)");
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.backdropTop} />
        <View style={styles.backdropBottom} />

        <View style={styles.card}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Ionicons name="shield-checkmark" size={18} color="#0b1d33" />
            </View>
            <View>
              <Text style={styles.kicker}>LOGI PORT</Text>
              <Text style={styles.title}>Đăng nhập tài xế</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            Truy cập nhanh vào dashboard, lịch hẹn và trạng thái cổng.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tên đăng nhập</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color="#8aa0bf" />
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Nhập tên đăng nhập"
                placeholderTextColor="#7f93ae"
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
            {fieldErrors.username ? (
              <Text style={styles.errorText}>{fieldErrors.username}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#8aa0bf" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#7f93ae"
                style={styles.input}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
            {fieldErrors.password ? (
              <Text style={styles.errorText}>{fieldErrors.password}</Text>
            ) : null}
          </View>

          {error ? <Text style={styles.formError}>{error}</Text> : null}

          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.loginButtonPressed,
            ]}
          >
            <Text style={styles.loginButtonText}>Xác nhận đăng nhập</Text>
          </Pressable>

          <Pressable
            onPress={handleGuestAccess}
            style={({ pressed }) => [
              styles.guestButton,
              pressed && styles.guestButtonPressed,
            ]}
          >
            <Text style={styles.guestButtonText}>
              Tiếp tục với tư cách khách
            </Text>
          </Pressable>

          <View style={styles.linksRow}>
            <Pressable onPress={() => router.push("/register")}>
              <Text style={styles.link}>Đăng ký tài khoản</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/forgot")}>
              <Text style={styles.linkMuted}>Quên mật khẩu?</Text>
            </Pressable>
          </View>
        </View>

        <Snackbar
          position="top-right"
          visible={registerToastVisible}
          message={
            params.username
              ? `Đăng ký thành công. Tên đăng nhập: ${params.username}`
              : "Đăng ký thành công. Vui lòng đăng nhập."
          }
          variant="success"
          onDismiss={() => setRegisterToastVisible(false)}
          duration={2800}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#08101f",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  backdropTop: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(121,168,255,0.12)",
  },
  backdropBottom: {
    position: "absolute",
    bottom: -100,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  card: {
    backgroundColor: "#0f1a2a",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f6b11c",
  },
  kicker: {
    color: "#79a8ff",
    fontSize: 12,
    letterSpacing: 1.6,
    fontWeight: "800",
  },
  title: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 2,
  },
  subtitle: {
    color: "#cbd5e1",
    marginTop: 12,
    lineHeight: 20,
  },
  fieldGroup: {
    marginTop: 18,
  },
  label: {
    color: "#e2e8f0",
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "700",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#091122",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#ff9c9c",
    marginTop: 6,
    fontSize: 12,
  },
  formError: {
    color: "#ffd1d1",
    marginTop: 14,
    backgroundColor: "rgba(239,124,84,0.16)",
    borderColor: "rgba(239,124,84,0.32)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    lineHeight: 18,
  },
  loginButton: {
    marginTop: 18,
    backgroundColor: "#f6b11c",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  loginButtonPressed: {
    backgroundColor: "#ffbf3f",
  },
  loginButtonText: {
    color: "#071122",
    fontWeight: "900",
    fontSize: 16,
  },
  guestButton: {
    marginTop: 12,
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(121,168,255,0.45)",
  },
  guestButtonPressed: {
    backgroundColor: "rgba(121,168,255,0.12)",
  },
  guestButtonText: {
    color: "#dbeafe",
    fontWeight: "800",
    fontSize: 15,
  },
  linksRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  link: {
    color: "#79a8ff",
    fontWeight: "700",
  },
  linkMuted: {
    color: "#cbd5e1",
    fontWeight: "600",
  },
});
