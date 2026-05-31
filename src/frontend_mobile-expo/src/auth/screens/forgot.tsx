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
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { recoverPassword } from "@/shared/state/auth";

export default function ForgotScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => {
    const result: Record<string, string> = {};
    const trimmedIdentifier = identifier.trim();

    if (submitted && trimmedIdentifier.length < 5) {
      result.identifier = "Nhập số điện thoại hoặc email để khôi phục.";
    }
    if (submitted && password.length < 6) {
      result.password = "Mật khẩu mới tối thiểu 6 ký tự.";
    }
    if (submitted && confirmPassword !== password) {
      result.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    return result;
  }, [confirmPassword, identifier, password, submitted]);

  async function handleRecovery() {
    setSubmitted(true);

    if (Object.keys(errors).length > 0) {
      Alert.alert(
        "Thông tin chưa hợp lệ",
        "Vui lòng kiểm tra lại form khôi phục.",
      );
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    const result = recoverPassword(identifier, password);
    if (!result.ok) {
      Alert.alert("Khôi phục thất bại", result.message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
  card: {
    backgroundColor: "#0f1a2a",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
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
    marginTop: 16,
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
  inputWrapError: {
    borderColor: "rgba(239,124,84,0.8)",
  },
  input: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "600",
  },
  errorText: {
    color: "#ff9c9c",
    marginTop: 6,
    fontSize: 12,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#f6b11c",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonPressed: {
    backgroundColor: "#ffbf3f",
  },
  submitButtonText: {
    color: "#071122",
    fontWeight: "900",
    fontSize: 16,
  },
  linkWrap: {
    marginTop: 18,
    alignItems: "center",
  },
  link: {
    color: "#79a8ff",
    fontWeight: "700",
  },
});
