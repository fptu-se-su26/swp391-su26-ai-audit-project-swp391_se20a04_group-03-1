/**
 * Label — Shared UI Component
 *
 * A simple text label component for form fields.
 * Replaces the old radix-ui Label primitive.
 *
 * @example
 * ```tsx
 * <Label>Biển số xe</Label>
 * <Input placeholder="Enter plate..." />
 * ```
 */
import React, { type ReactNode } from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';
import { palette } from '@/core/theme';

interface LabelProps {
  children: ReactNode;
  style?: TextStyle;
  /** Visually indicate this field is required */
  required?: boolean;
}

export function Label({ children, style, required }: LabelProps) {
  return (
    <Text style={[styles.label, style]}>
      {children}
      {required ? <Text style={styles.asterisk}> *</Text> : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    color: palette.textSoft,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  asterisk: {
    color: palette.danger,
  },
});
