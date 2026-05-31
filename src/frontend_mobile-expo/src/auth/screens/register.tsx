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

import { registerAccount } from "@/shared/state/auth";

type RegisterForm = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialForm: RegisterForm = {
  fullName: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(\+?\d{9,15})$/;

function validate(form: RegisterForm) {
  const errors: Partial<Record<keyof RegisterForm, string>> = {};

  if (form.fullName.trim().length < 3)
    errors.fullName = "Họ tên phải có ít nhất 3 ký tự.";
  if (!phonePattern.test(form.phone.replace(/\s+/g, "")))
    errors.phone = "Số điện thoại chưa hợp lệ.";
  if (!emailPattern.test(form.email.trim()))
    errors.email = "Email chưa đúng định dạng.";
  if (form.password.length < 6) errors.password = "Mật khẩu tối thiểu 6 ký tự.";
  if (form.confirmPassword !== form.password)
    errors.confirmPassword = "Mật khẩu xác nhận không khớp.";

  return errors;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const errors = useMemo(() => validate(form), [form]);

  async function handleRegister() {
    const currentErrors = validate(form);
    if (Object.keys(currentErrors).length > 0) {
      Alert.alert(
        "Thông tin chưa hợp lệ",
        "Vui lòng kiểm tra lại các trường được đánh dấu.",
      );
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    const result = registerAccount({
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
      password: form.password,
    });

    if (!result.ok) {
      Alert.alert("Không thể đăng ký", result.message);
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({
      pathname: "/login",
      params: {
        authToast: "register-success",
        username: result.account.username,
      },
    });
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
              <Ionicons name="person-add-outline" size={18} color="#0b1d33" />
            </View>
            <View>
              <Text style={styles.kicker}>TẠO HỒ SƠ</Text>
              <Text style={styles.title}>Đăng ký tài khoản</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            Nhập thông tin cơ bản để hệ thống tạo hồ sơ tài xế mới.
          </Text>

          <Field
            label="Họ tên"
            icon="person-outline"
            value={form.fullName}
            onChangeText={(value) =>
              setForm((current) => ({ ...current, fullName: value }))
            }
            placeholder="Nhập họ tên"
            error={errors.fullName}
          />

          <Field
            label="Số điện thoại"
            icon="call-outline"
            value={form.phone}
            onChangeText={(value) =>
              setForm((current) => ({ ...current, phone: value }))
            }
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <Field
            label="Email"
            icon="mail-outline"
            value={form.email}
            onChangeText={(value) =>
              setForm((current) => ({ ...current, email: value }))
            }
            placeholder="Nhập email"
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email}
          />

          <Field
            label="Mật khẩu"
            icon="lock-closed-outline"
            value={form.password}
            onChangeText={(value) =>
              setForm((current) => ({ ...current, password: value }))
            }
            placeholder="Nhập mật khẩu"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />

          <Field
            label="Xác nhận mật khẩu"
            icon="shield-checkmark-outline"
            value={form.confirmPassword}
            onChangeText={(value) =>
              setForm((current) => ({ ...current, confirmPassword: value }))
            }
            placeholder="Nhập lại mật khẩu"
            secureTextEntry
            autoCapitalize="none"
            error={errors.confirmPassword}
          />

          <Pressable
            onPress={handleRegister}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
            ]}
          >
            <Text style={styles.submitButtonText}>Đăng ký</Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/login")}
            style={styles.linkWrap}
          >
            <Text style={styles.link}>Đã có tài khoản? Quay lại đăng nhập</Text>
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
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
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
  keyboardType = "default",
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
          keyboardType={keyboardType}
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
    backgroundColor: "#79a8ff",
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
    backgroundColor: "#79a8ff",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonPressed: {
    backgroundColor: "#92bbff",
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
    color: "#f8fafc",
    fontWeight: "700",
  },
});
