import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#08101f",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: "#0f1a2a",
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 20,
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
    marginTop: 10,
    lineHeight: 20,
  },
  fieldGroup: {
    marginTop: 12,
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
    paddingVertical: 11,
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
    marginTop: 16,
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
    marginTop: 16,
    alignItems: "center",
  },
  link: {
    color: "#f8fafc",
    fontWeight: "700",
  },
});

export default styles;
