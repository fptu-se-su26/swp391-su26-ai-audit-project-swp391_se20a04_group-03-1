import { StyleSheet } from "react-native";
import { palette } from "@/shared/theme";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.bgDeep,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  backdropTop: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(30,215,96,0.12)",
  },
  backdropBottom: {
    position: "absolute",
    bottom: -100,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: palette.surface,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    shadowColor: "#000",
    shadowOpacity: 0.35,
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
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.accent,
  },
  wordmark: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: palette.text,
  },
  wordmarkAccent: {
    color: palette.accent,
  },
  title: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 14,
  },
  subtitle: {
    color: palette.textMuted,
    marginTop: 8,
    lineHeight: 20,
  },
  fieldGroup: {
    marginTop: 16,
  },
  label: {
    color: palette.textSoft,
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "700",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: palette.bgDeep,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    color: palette.text,
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: palette.danger,
    marginTop: 6,
    fontSize: 12,
  },
  formError: {
    color: "#fecaca",
    marginTop: 14,
    backgroundColor: "rgba(239,68,68,0.14)",
    borderColor: "rgba(239,68,68,0.32)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    lineHeight: 18,
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: palette.accent,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  loginButtonPressed: {
    backgroundColor: palette.accentHover,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: palette.ink,
    fontWeight: "900",
    fontSize: 16,
  },
  linksRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
  },
  linkMuted: {
    color: palette.textMuted,
    fontWeight: "600",
  },
});

export default styles;
