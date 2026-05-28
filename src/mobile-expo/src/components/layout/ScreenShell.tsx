import React, { ReactNode } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { stitchPalette } from "../../theme/stitchPalette";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  hideHeader?: boolean;
};

export default function ScreenShell({
  title,
  subtitle,
  children,
  hideHeader = false,
}: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {!hideHeader ? (
          <View style={styles.header}>
            <View style={styles.accentBar} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: stitchPalette.bg,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    backgroundColor: stitchPalette.surfaceAlt,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: stitchPalette.borderSoft,
    overflow: "hidden",
  },
  accentBar: {
    height: 4,
    width: 72,
    borderRadius: 999,
    backgroundColor: stitchPalette.accent,
    marginBottom: 12,
  },
  title: {
    color: stitchPalette.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: stitchPalette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
