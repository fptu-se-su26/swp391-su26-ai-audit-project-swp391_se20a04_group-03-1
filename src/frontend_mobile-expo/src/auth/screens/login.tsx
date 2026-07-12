import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { signIn, useAuth } from "@/shared/state/auth";
import { palette } from "@/shared/theme";
import styles from "../style/Login.style";

const isFilled = (value: string) => value.trim().length > 0;

export default function LoginScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fieldErrors = useMemo(
    () => ({
      email: submitted && !isFilled(email) ? "Vui lòng nhập email." : "",
      password:
        submitted && !isFilled(password) ? "Vui lòng nhập mật khẩu." : "",
    }),
    [email, password, submitted],
  );

  // Đã đăng nhập -> điều hướng theo vai trò.
  useEffect(() => {
    if (auth.isReady && auth.isAuthenticated) {
      router.replace(auth.role === "gate_manager" ? "/(gate)" : "/(driver)");
    }
  }, [auth.isAuthenticated, auth.isReady, auth.role, router]);

  async function handleSubmit() {
    setSubmitted(true);
    setError("");

    if (!isFilled(email) || !isFilled(password)) {
      setError("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.message ?? "Đăng nhập thất bại");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace(result.role === "gate_manager" ? "/(gate)" : "/(driver)");
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
              <Ionicons name="cube" size={20} color={palette.ink} />
            </View>
            <Text style={styles.wordmark}>
              Logi<Text style={styles.wordmarkAccent}>Port</Text>
            </Text>
          </View>

          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>
            Tài khoản do quản trị viên cấp. Hệ thống tự nhận diện vai trò Tài xế
            hoặc Quản lý cổng của bạn.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={palette.textSubtle} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Nhập email"
                placeholderTextColor={palette.textSubtle}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>
            {fieldErrors.email ? (
              <Text style={styles.errorText}>{fieldErrors.email}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputWrap}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={palette.textSubtle}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={palette.textSubtle}
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
            disabled={loading}
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.loginButtonPressed,
              loading && styles.loginButtonDisabled,
            ]}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Đang đăng nhập…" : "Đăng nhập"}
            </Text>
          </Pressable>

          <View style={styles.linksRow}>
            <Pressable onPress={() => router.push("/forgot")}>
              <Text style={styles.linkMuted}>Quên mật khẩu?</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
