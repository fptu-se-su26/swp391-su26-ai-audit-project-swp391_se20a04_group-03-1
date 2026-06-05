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
  Text,
  TextInput,
  View,
} from "react-native";

import { Snackbar } from "@/shared/components/feedback/Snackbar";
import { signIn, signInAsGuest, useAuth } from "@/shared/state/auth";
import styles from "../style/Login.style";

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
