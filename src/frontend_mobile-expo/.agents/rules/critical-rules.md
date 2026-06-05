---
trigger: always_on
---

NO NATIVE LINKING: Absolutely NO use of libraries that require react-native link, manual modifications to android/ or ios/ folders, or manual pod install executions.

EXPO FIRST ECOSYSTEM: Always prioritize official Expo libraries. (e.g., replace react-native-camera with expo-camera, react-native-fs with expo-file-system).

CONFIG PLUGINS FALLBACK: If a necessary third-party native library does not have an Expo alternative, you MUST check if it supports Expo Config Plugins. If it does, provide explicit instructions on how to configure it in app.json or app.config.js.

PRESERVE DIRECTORY STRUCTURE: Maintain the original logical folder structure (components, hooks, utils, services) as much as possible to facilitate easy comparison. Only modify the internal code of the files (imports, hooks, native API logic).

DEV CLIENT AWARENESS: Clearly distinguish between libraries that run seamlessly on "Expo Go" and those that require a "Custom Dev Client" (Expo Prebuild). If the code you generate requires a Dev Client, you must clearly warn the user.