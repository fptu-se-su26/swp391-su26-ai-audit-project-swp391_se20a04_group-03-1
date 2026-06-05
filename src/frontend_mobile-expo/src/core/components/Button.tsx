/**
 * Button — Shared UI Component
 *
 * A CVA-powered button component built with React Native primitives.
 * Replaces the old web-based button that used HTML `<button>` and Tailwind classes.
 *
 * Uses `cva` for variant logic but applies React Native StyleSheet styles.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onPress={handleSubmit}>
 *   Xác nhận
 * </Button>
 *
 * <Button variant="outline" size="sm" icon={<Ionicons name="add" />}>
 *   Thêm mới
 * </Button>
 * ```
 */
import React, { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
  type TextStyle,
  type PressableProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { palette } from '@/core/theme';

// ─── Variant Definitions ─────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Button label */
  children: ReactNode;
  /** Optional leading icon */
  icon?: ReactNode;
  /** Show loading spinner and disable interaction */
  loading?: boolean;
}

// ─── Style Maps ──────────────────────────────────────────────────────────────

const variantContainerStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: palette.accent,
    borderColor: 'transparent',
  },
  secondary: {
    backgroundColor: palette.surfaceMuted,
    borderColor: palette.borderSoft,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: palette.borderStrong,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
};

const variantTextStyles: Record<ButtonVariant, TextStyle> = {
  primary: { color: palette.ink },
  secondary: { color: palette.text },
  outline: { color: palette.text },
  ghost: { color: palette.textSoft },
  danger: { color: palette.danger },
};

const sizeContainerStyles: Record<ButtonSize, ViewStyle> = {
  xs: { height: 28, paddingHorizontal: 10, borderRadius: 6 },
  sm: { height: 34, paddingHorizontal: 14, borderRadius: 8 },
  md: { height: 42, paddingHorizontal: 18, borderRadius: 10 },
  lg: { height: 50, paddingHorizontal: 24, borderRadius: 14 },
};

const sizeTextStyles: Record<ButtonSize, TextStyle> = {
  xs: { fontSize: 11 },
  sm: { fontSize: 12 },
  md: { fontSize: 14 },
  lg: { fontSize: 16 },
};

// ─── Animated Pressable ──────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Component ───────────────────────────────────────────────────────────────

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      {...rest}
      disabled={isDisabled}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      style={[
        styles.base,
        variantContainerStyles[variant],
        sizeContainerStyles[size],
        isDisabled && styles.disabled,
        animatedStyle,
        style as ViewStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantTextStyles[variant].color}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              variantTextStyles[variant],
              sizeTextStyles[size],
            ]}
          >
            {children}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}

// ─── Base Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
  },
  label: {
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});
