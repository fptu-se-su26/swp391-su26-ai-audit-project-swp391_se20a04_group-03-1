import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
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

import { recoverPassword } from "@/shared/state/auth";
import styles from "../style/Forgot.style";

export default function ForgotScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => {
    const result: Record<string, string> = {};
    const trimmedIdentifier = identifier.trim();

    if (submitted && trimmedIdentifier.length < 5)
      result.identifier = "Nhập số điện thoại hoặc email để khôi phục.";
    if (submitted && password.length < 6)
      result.password = "Mật khẩu mới tối thiểu 6 ký tự.";
    if (submitted && confirmPassword !== password)
      result.confirmPassword = "Mật khẩu xác nhận không khớp.";
    return result;
  }, [confirmPassword, identifier, password, submitted]);

  async function handleRecovery() {
    setSubmitted(true);

    if (Object.keys(errors).length > 0) {
      Alert.alert(
        "Thông tin chưa hợp lệ",
        "Vui lòng kiểm tra lại form khôi phục.",
      );
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        );
      } catch (error) {
        // ignore haptics on web / unsupported devices
      }
      return;
    }

    const result = recoverPassword(identifier, password);
    if (!result.ok) {
      Alert.alert("Khôi phục thất bại", result.message);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (error) {
        // ignore haptics on web / unsupported devices
      }
      return;
    }

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // ignore haptics on web / unsupported devices
    }

    Alert.alert(
      "Khôi phục thành công",
      "Mật khẩu đã được cập nhật. Hãy đăng nhập lại.",
      [{ text: "Về trang đăng nhập", onPress: () => router.replace("/login") }],
    );
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
        <View style={styles.card}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Ionicons name="key-outline" size={18} color="#0b1d33" />
            </View>
            <View>
              <Text style={styles.kicker}>KHÔI PHỤC TÀI KHOẢN</Text>
              <Text style={styles.title}>Quên mật khẩu</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            Nhập số điện thoại hoặc email đã đăng ký để tạo mật khẩu mới.
          </Text>

          <Field
            label="Số điện thoại / Email"
            icon="mail-open-outline"
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="Nhập số điện thoại hoặc email"
            autoCapitalize="none"
            error={errors.identifier}
          />

          <Field
            label="Mật khẩu mới"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="Nhập mật khẩu mới"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />

          <Field
            label="Xác nhận mật khẩu"
            icon="shield-checkmark-outline"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Nhập lại mật khẩu mới"
            secureTextEntry
            autoCapitalize="none"
            error={errors.confirmPassword}
          />

          <Pressable
            onPress={handleRecovery}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
            ]}
          >
            <Text style={styles.submitButtonText}>Khôi phục tài khoản</Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/login")}
            style={styles.linkWrap}
          >
            <Text style={styles.link}>Quay lại đăng nhập</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type FieldProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

function Field({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  autoCapitalize = "sentences",
}: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error ? styles.inputWrapError : null]}>
        <Ionicons name={icon} size={18} color="#8aa0bf" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#7f93ae"
          style={styles.input}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}
