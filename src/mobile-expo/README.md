# 🚢 Tài Xế Cảng — Smart Port Driver Mobile App

> A mobile application for port truck drivers to manage check-ins, view appointments, monitor yard availability, and display dynamically generated QR codes for security guards to scan at smart IoT-enabled port gates.

---

## 📖 Overview

**Tài Xế Cảng** (Port Driver) is the mobile-facing module of a larger Smart Port IoT audit system. It provides port truck drivers with a real-time operational dashboard to:

- Track their appointment schedule and gate assignments
- Check in at port gates by displaying a dynamically generated QR code for security guards to scan
- Monitor parking yard occupancy across multiple zones
- Receive and view port notifications and alerts

The app is designed with a dark, industrial aesthetic ("Industrial Dark Mode") to ensure readability in outdoor/port environments.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📊 **Dashboard** | Real-time summary of check-ins, free yard spots, pending tasks, and active alerts |
| 📅 **Appointments** | View daily appointment schedule with status filtering (All / Active / Pending / History) |
| 📲 **My QR Code** | Displays a dynamically generated QR code containing driver info for security guards to scan at port gates |
| 🅿️ **Yard Map** | Visual overview of parking spot status per zone (Free / Occupied / Reserved), dynamically calculated from live data |
| 🔔 **Notifications** | Port notification feed with unread indicators, category icons, and empty-state UI |
| ⚙️ **Settings** | Driver profile, push notification toggle, dark mode toggle, fully-typed navigation |
| 🌙 **Industrial Dark Theme** | Consistent deep-navy color palette optimized for outdoor use |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Language** | TypeScript 6.x |
| **Framework** | React Native 0.85 via Expo SDK ~56 |
| **Navigation** | React Navigation v7 (Bottom Tabs + Native Stack) |
| **State / Server State** | TanStack React Query v5 + Zustand v5 |
| **QR Code Generation** | `react-native-qrcode-svg` + `react-native-svg` |
| **Animations** | `react-native-reanimated` v4, `framer-motion` v12 |
| **Icons** | `@expo/vector-icons` (Ionicons), `lucide-react` |
| **UI Utilities** | `class-variance-authority`, `tailwind-merge`, `react-native-paper` |
| **Gestures** | `react-native-gesture-handler` |
| **Bundler/Transpiler** | Babel with `babel-preset-expo` |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** `>= 18.x` (LTS recommended)
- **npm** `>= 9.x` or **Yarn** `>= 1.22.x`
- **Expo CLI** — install globally:
  ```bash
  npm install -g expo-cli
  ```
- **Expo Go** app on your physical device (iOS / Android) — [Download here](https://expo.dev/client)
- **Android Studio** (optional, for Android emulator) or **Xcode** (optional, for iOS simulator — macOS only)

---

## ⚙️ Environment Setup

No `.env` file is currently required. The app uses **mock/stub data** served from `src/services/portalApi.ts` (simulated with `setTimeout` delays). When a real backend is integrated, an environment configuration file (e.g., `.env`) will be needed to supply the API base URL.

---

## 🚀 Installation & Running

### 1. Navigate to the project directory

```bash
cd src/mobile-expo
```

### 2. Install dependencies

Using npm:
```bash
npm install
```

Or using Yarn:
```bash
yarn install
```

### 3. Start the development server

```bash
# Start Expo dev server (scan QR with Expo Go)
npm start
# or
yarn start

# Run on Android emulator / connected device
npm run android
# or
yarn android

# Run on iOS simulator (macOS only)
npm run ios
# or
yarn ios

# Run in web browser
npm run web
# or
yarn web
```

### 4. Open on device

- **Physical device**: Open the **Expo Go** app and scan the QR code shown in the terminal.
- **Android emulator**: Press `a` in the Expo terminal.
- **iOS simulator**: Press `i` in the Expo terminal (macOS only).

---

## 📁 Folder Structure

```
mobile-expo/
├── App.tsx                     # Root entry point (re-exports src/App.tsx)
├── index.tsx                   # Expo entry file (registers root component)
├── app.json                    # Expo configuration (name, icons, plugins)
├── babel.config.js             # Babel transpiler configuration
├── tsconfig.json               # TypeScript compiler configuration
├── package.json                # Dependencies and scripts
│
└── src/
    ├── App.tsx                 # App providers (Navigation, QueryClient, GestureHandler)
    │
    ├── navigation/
    │   └── AppNavigator.tsx    # Stack + Tab navigator definitions and type exports
    │
    ├── screens/
    │   ├── dashboard/
    │   │   └── DashboardScreen.tsx     # Main home screen with stats and QR shortcut
    │   ├── notifications/
    │   │   └── NotificationsScreen.tsx # Port notification feed with unread indicators
    │   ├── appointments/
    │   │   └── AppointmentsScreen.tsx  # Appointment list with filter tabs
    │   ├── qr/
    │   │   └── MyQRCodeScreen.tsx      # Displays generated QR code with driver info
    │   ├── yard/
    │   │   └── YardScreen.tsx          # Parking yard spot overview (dynamic stats)
    │   └── settings/
    │       └── SettingsScreen.tsx      # Profile, preferences, logout
    │
    ├── components/
    │   ├── layout/
    │   │   └── ScreenShell.tsx         # Shared scrollable screen wrapper with header
    │   ├── qr/
    │   │   ├── QRScannerNative.tsx     # Legacy POC skeleton (unused)
    │   │   └── README.md               # Notes on native scanner setup
    │   └── ui/
    │       ├── button.tsx              # CVA-powered Button (web-ported, unused in native)
    │       ├── card.tsx                # Card component (web-ported)
    │       ├── input.tsx               # Input component (web-ported)
    │       ├── label.tsx               # Label component (web-ported)
    │       ├── query-state-handler.tsx # Shared loading/error/skeleton wrapper for useQuery
    │       ├── snackbar.tsx            # Snackbar component (web-ported)
    │       └── video-stream.tsx        # MJPEG video stream viewer (React Native, WebView)
    │
    ├── services/
    │   └── portalApi.ts        # API service layer (currently stub/mock data)
    │
    ├── theme/
    │   └── stitchPalette.ts    # Central color palette / design token object
    │
    ├── types/
    │   ├── portal.ts           # Core domain TypeScript types (Appointment, YardSpot, etc.)
    │   ├── vision-camera-code-scanner.d.ts  # Type stub (legacy, unused)
    │   └── zxing-browser.d.ts  # Type stub for ZXing browser library
    │
    ├── lib/
    │   ├── astar.ts              # A* pathfinding algorithm (for future yard routing)
    │   ├── use-realtime-spots.ts # Simulated real-time spot update hook
    │   ├── use-sse.ts            # SSE hook (react-native-sse, reconnect logic)
    │   └── utils.ts              # Utility: `cn()` helper (clsx + tailwind-merge)
    │
    └── assets/
        └── expo/               # App icons, splash screen, and favicon assets
```

---

## 📄 License

See [LICENSE](./LICENSE) for details.
