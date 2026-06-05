/**
 * Input — Shared UI Component
 *
 * A styled TextInput with focus states and error handling.
 * Replaces the old web-based `<input>` component.
 *
 * @example
 * ```tsx
 * <Input
 *   placeholder="Enter vehicle plate..."
 *   value={plate}
 *   onChangeText={setPlate}
 *   error={errors.plate}
 * />
 * ```
 */
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { palette, radii, spacing } from '@/shared/theme';

interface InputProps extends TextInputProps {
  /** Error message to display below the input */
  error?: string;
  /** Label shown above the input */
  label?: string;
  /** Container style override */
  containerStyle?: ViewStyle;
}

export function Input({
  error,
  label,
  containerStyle,
  style,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={palette.textSubtle}
        {...rest}
        onFocus={(e) => {
          setIsFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error ? styles.inputError : undefined,
          style,
        ]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    color: palette.textSoft,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    height: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: spacing.md,
    color: palette.text,
    fontSize: 14,
  },
  inputFocused: {
    borderColor: palette.accent,
    borderWidth: 1.5,
  },
  inputError: {
    borderColor: palette.danger,
  },
  errorText: {
    color: palette.danger,
    fontSize: 12,
    marginTop: 2,
  },
});
