# Tài Xế Cảng — Technical Project Details

> **Audience**: Developers maintaining or scaling the mobile-expo application.
> **Last analyzed**: 2026-05-28

---

## 1. System Architecture

### Design Pattern

The project follows a **Feature-Sliced / Screen-Centric** architecture — a pragmatic pattern commonly used in React Native apps — where each screen is a self-contained module that owns its local UI, data-fetching logic, and sub-components. There is no strict MVC or MVVM separation; instead, responsibilities are distributed as follows:

| Layer | Responsibility | Location |
|---|---|---|
| **View** | Rendered JSX + `StyleSheet` styles | `src/screens/**` |
| **ViewModel (implicit)** | `useQuery` hooks & `useState` for local state | inside each screen component |
| **Model / Domain Types** | TypeScript interfaces for data shapes | `src/types/portal.ts` |
| **Service / Repository** | API fetch functions | `src/services/portalApi.ts` |
| **Navigation** | Route definitions and typed param lists | `src/navigation/AppNavigator.tsx` |
| **Design Tokens** | Central color palette object | `src/theme/stitchPalette.ts` |

### Navigation Structure

```
Stack.Navigator (AppNavigator)
│
├── Screen: "MainTabs"  (headerShown: false)
│   └── Tab.Navigator
│       ├── Tab: "Dashboard"     → DashboardScreen
│       ├── Tab: "Appointments"  → AppointmentsScreen
│       ├── Tab: "Yard"          → YardScreen
│       └── Tab: "Settings"      → SettingsScreen
│
└── Screen: "QRScanner"  (modal presentation)
    └── QRScannerScreen
```

- The root navigator is a **Native Stack** (`createNativeStackNavigator`).
- The main app lives inside a **Bottom Tab** navigator (`createBottomTabNavigator`).
- `QRScannerScreen` is a **modal** pushed on top of the tab stack and can be navigated to from both `DashboardScreen` and `AppointmentsScreen` via `navigation.getParent()?.navigate("QRScanner")`.

---

## 2. Core Modules & Screens

### 2.1 `src/App.tsx` — Provider Tree

The top-level `App` component wraps the entire application in a layered provider tree:

```
GestureHandlerRootView         ← Required for react-native-gesture-handler
  └─ SafeAreaProvider          ← Provides safe-area insets across the app
       └─ QueryClientProvider  ← Provides TanStack Query context (single QueryClient instance)
            └─ NavigationContainer (theme: custom DarkTheme)
                 └─ AppNavigator
```

A custom dark navigation theme is defined inline with a deep-navy background (`#07111f`), amber primary (`#f59e0b`), and dark card/border values.

---

### 2.2 `DashboardScreen` — Home / Overview

**File**: `src/screens/dashboard/DashboardScreen.tsx`

**Purpose**: Acts as the operational command center for the driver. On mount, it fires **four parallel TanStack Query fetches** and aggregates the results into summary statistics.

**Data fetched**:
| Query Key | Fetcher | Used For |
|---|---|---|
| `["dashboard-summary"]` | `fetchDashboardSummary()` | KPI chips (check-ins, free spots, alerts, pending) |
| `["notifications"]` | `fetchNotifications()` | Unread alert count fallback |
| `["appointments"]` | `fetchAppointments()` | Top-2 schedule cards + pending count fallback |
| `["yard-spots"]` | `fetchYardSpots()` | Free spot count fallback |

**Key UI sections**:
1. **Header Bar** — Brand logo + signal glyph indicator
2. **Connection Panel** — Shows active connection status (hardcoded `SENS-ORCH-729`)
3. **QR Check-in Card** — Pressable; navigates to `QRScannerScreen` modal
4. **Schedule Stack** — First two appointments rendered as `ScheduleCard` cards
5. **Stat Chips** — Four KPI chips at the bottom

**Internal sub-components** (co-located within the file):
- `InfoTile` — label/value pair with optional right-alignment
- `ScheduleCard` — appointment card with color accent strip and gate number
- `MiniQrPreview` — static 7×7 pixel art QR code rendered using `View` grids
- `StatChip` — compact label/number KPI block
- `mapScheduleStatus()` — translates API status strings to Vietnamese display labels

---

### 2.3 `AppointmentsScreen` — Appointment Management

**File**: `src/screens/appointments/AppointmentsScreen.tsx`

**Purpose**: Lists all of the driver's appointments for the day with filtering and action capabilities.

**State**:
- `activeFilter: FilterKey` — local `useState` controlling which subset of appointments is shown

**Filtering logic** (via `useMemo`):

| Filter Key | Logic |
|---|---|
| `"all"` | Returns all appointments |
| `"active"` | Status is `"Confirmed"` or `"Waiting"` |
| `"pending"` | Status is `"Pending"` |
| `"history"` | Status is not `"Pending"` |

**Actions per appointment card**:
- If `status === "Confirmed"` → Primary action navigates to `QRScannerScreen`
- Otherwise → Shows an `Alert.alert()` dialog prompting the driver to wait

**Internal sub-components**:
- `SummaryChip` — compact chip showing confirmed/pending/waiting counts

---

### 2.4 `QRScannerScreen` — QR Code Check-in

**File**: `src/screens/scanner/QRScannerScreen.tsx`

**Purpose**: Full-screen camera view for scanning QR codes at port gates.

**Permission handling flow**:
1. `useCameraPermissions()` hook from `expo-camera` is used.
2. On mount, if permission is not granted, `requestPermission()` is called automatically.
3. Three UI states: *loading* (null permission), *denied* (shows grant button), *granted* (shows live camera).

**Scanning flow**:
1. `CameraView` from `expo-camera` is configured for `barcodeScannerSettings={{ barcodeTypes: ["qr"] }}`.
2. `onBarcodeScanned` callback fires once (guarded by `scannedData` state).
3. On successful scan: shows `Alert.alert()` with scanned data → navigates back on dismiss.

**Scan lock**: Once `scannedData` is set, `onBarcodeScanned` is passed `undefined` to prevent re-triggering.

---

### 2.5 `YardScreen` — Parking Yard Overview

**File**: `src/screens/yard/YardScreen.tsx`

**Purpose**: Displays a list of all parking spots with their zone and real-time occupancy status.

**Data**: Fetched via `useQuery(["yard-spots"], fetchYardSpots)`.

**Status indicators**:
| Status | Color |
|---|---|
| `Free` | Green (`#047857` bg, `#d1fae5` text) |
| `Occupied` | Red (`#dc2626` bg, `#fee2e2` text) |
| `Reserved` | Amber (`#f59e0b` bg, `#fff7ed` text) |

> **Note**: The summary cards at the top (24 free, 18 occupied, 6 reserved) are **hardcoded** and do not derive from the fetched `spots` array. This is a known inconsistency.

---

### 2.6 `SettingsScreen` — Profile & Preferences

**File**: `src/screens/settings/SettingsScreen.tsx`

**Purpose**: Driver profile view and app preferences panel.

**Hardcoded profile data** (to be replaced with real auth/session data):
```ts
{ fullName: "Nguyen Van An", license: "VN-99283-8821", company: "Saigon Port Logistics J.S.C" }
```

**Toggle states** (local only, not persisted):
- `pushEnabled` — Push notifications toggle
- `darkMode` — Dark mode toggle (UI only; does not affect actual theme)

**Navigation links** (currently navigate to `"Notifications"` tab which does not exist — a bug):
- Help Center
- Terms of Service

**Logout button** — navigates to `"Dashboard"` (no auth state is cleared).

---

### 2.7 `ScreenShell` — Layout Wrapper Component

**File**: `src/components/layout/ScreenShell.tsx`

**Purpose**: A reusable layout wrapper used by every main screen. Provides consistent `SafeAreaView` + `ScrollView` with optional header block.

**Props**:
```ts
type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  hideHeader?: boolean;  // Default: false
};
```

When `hideHeader={true}` (used by `DashboardScreen`), the screen manages its own custom header.

---

## 3. Data Flow & State Management

### 3.1 Server State — TanStack React Query

All remote data fetching is handled by **TanStack React Query v5**. A single `QueryClient` instance is created in `src/App.tsx` and provided via `QueryClientProvider`.

**Current query keys and their data shapes**:

```
["dashboard-summary"]  → DashboardSummary
["notifications"]      → NotificationItem[]
["appointments"]       → AppointmentItem[]
["yard-spots"]         → YardSpot[]
```

Because multiple screens use the same query keys (e.g., `["appointments"]` is fetched in both `DashboardScreen` and `AppointmentsScreen`), React Query's **built-in cache deduplication** ensures the API is only called once and the data is shared automatically.

**Stale/refetch policy**: Default React Query behavior (stale after 0ms, refetch on window focus). No custom `staleTime` or `gcTime` is configured.

### 3.2 Local UI State — React `useState`

- `AppointmentsScreen`: `activeFilter` for the currently selected filter tab
- `SettingsScreen`: `pushEnabled`, `darkMode` for toggle switches
- `QRScannerScreen`: `scannedData` to lock the scanner after first successful scan

### 3.3 Global State — Zustand (Declared, Not Yet Used)

`zustand` v5 is listed as a dependency in `package.json` but **no Zustand stores are implemented** in the current codebase. It is available for future use (e.g., auth state, user session, persistent preferences).

### 3.4 Data Flow Diagram

```
portalApi.ts (mock stub)
    │
    ├── fetchDashboardSummary() ──→ useQuery(["dashboard-summary"]) ──→ DashboardScreen
    ├── fetchNotifications()    ──→ useQuery(["notifications"])     ──→ DashboardScreen
    ├── fetchAppointments()     ──→ useQuery(["appointments"])      ──→ DashboardScreen
    │                                                               ──→ AppointmentsScreen (cache hit)
    └── fetchYardSpots()        ──→ useQuery(["yard-spots"])        ──→ DashboardScreen
                                                                    ──→ YardScreen (cache hit)
```

---

## 4. Key Third-Party Dependencies

| Library | Version | Purpose |
|---|---|---|
| `expo` | ~56.0.5 | Core Expo SDK — build toolchain, device APIs |
| `expo-camera` | ^56.0.7 | Camera access and QR barcode scanning |
| `@react-navigation/native` | ^7.2.5 | Navigation container and core hooks |
| `@react-navigation/bottom-tabs` | ^7.16.2 | Bottom tab bar navigator |
| `@react-navigation/native-stack` | ^7.16.0 | Native stack navigator (modal support) |
| `@tanstack/react-query` | ^5.100.14 | Async server state management, caching, deduplication |
| `zustand` | ^5.0.13 | Global client state management (declared, not yet used) |
| `react-native-reanimated` | ^4.4.0 | High-performance animations (Babel plugin required) |
| `react-native-gesture-handler` | ^2.31.2 | Touch gesture recognition (required by navigation) |
| `react-native-safe-area-context` | ^5.8.0 | Safe area insets (notch/status bar awareness) |
| `react-native-screens` | ^4.25.2 | Native screen containers for navigation performance |
| `@expo/vector-icons` | ^15.1.1 | Ionicons icon set |
| `react-native-paper` | ^5.15.3 | Material Design components (declared, not actively used) |
| `lottie-react-native` | ^7.3.8 | Lottie animation playback (declared, not actively used) |
| `class-variance-authority` | ^0.7.1 | Variant-based component styling (used by ported `button.tsx`) |
| `tailwind-merge` | ^3.6.0 | CSS class merging utility (used by `cn()` helper) |
| `@zxing/browser` + `@zxing/library` | ^0.2.0 / ^0.22.0 | ZXing QR code library (web-only, not used in native) |
| `vision-camera-code-scanner` | ^0.2.0 | Native QR scanner plugin (POC skeleton only) |
| `framer-motion` | ^12.40.0 | Web animation library (declared, not used in native screens) |
| `axios` | ^1.16.1 | HTTP client (declared, not yet connected to real API) |
| `lucide-react` | ^1.16.0 | Web icon library (used only in ported `video-stream.tsx`) |
| `radix-ui` | ^1.4.3 | Web headless UI primitives (used only in ported `button.tsx`) |

---

## 5. API Integrations & Data Layer

### 5.1 Current State: Mock / Stub API

All data is currently served from a **local in-memory mock** in `src/services/portalApi.ts`. Each function simulates network latency using a `delay()` helper:

```ts
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchDashboardSummary() {
  await delay(250);
  return dashboardSummary; // returns hardcoded object
}
```

**Mock data shapes** (`src/types/portal.ts`):

```ts
type DashboardSummary = {
  checkInsToday: number;
  freeSpots: number;
  pendingTasks: number;
  activeAlerts: number;
  nextAppointment: string;  // e.g. "10:30 - Truck 19"
};

type NotificationItem = {
  id: string;
  title: string;
  time: string;
  status: "Unread" | "Read";
  level: "info" | "warning" | "success";
};

type AppointmentItem = {
  code: string;   // e.g. "AP-1024"
  time: string;   // e.g. "09:30"
  truck: string;  // e.g. "Truck 19"
  status: "Confirmed" | "Pending" | "Waiting";
};

type YardSpot = {
  id: string;     // e.g. "A-01"
  zone: string;   // e.g. "A"
  status: "Free" | "Occupied" | "Reserved";
};
```

### 5.2 Planned Real-Time Integration

The `src/lib/` directory contains two hooks prepared for a live backend:

**`useSSE(url, onMessage, options)`** (`src/lib/use-sse.ts`):
- Connects to a Server-Sent Events endpoint.
- Handles automatic reconnection on error with configurable `reconnectInterval`.
- Returns an `EventSource` ref for cleanup.
- Currently not wired to any screen.

**`useRealtimeSpots()`** (`src/lib/use-realtime-spots.ts`):
- Currently simulates real-time spot status changes every 3 seconds using `setInterval`.
- Imports from `@/app/client/parking/parking-map` (a Next.js web app path alias) — **this import will fail in the native context** and must be refactored to use the local `YardSpot` type.

**`axios`** is installed and available for REST API calls once the backend base URL is configured.

### 5.3 A* Pathfinding (`src/lib/astar.ts`)

A complete A* pathfinding algorithm is implemented using Manhattan distance heuristic. It is intended for a future feature: **guiding drivers to the nearest free parking spot** on a grid map of the yard.

```ts
// Finds shortest path from start to goal on a grid (0 = walkable, non-zero = blocked)
findPath(start: Point, goal: Point, grid: number[][]): Point[] | null
```

### 5.4 Video Stream (`src/components/ui/video-stream.tsx`)

A `VideoStream` component renders a `<img>` tag pointing to an MJPEG stream from a Flask backend (`http://localhost:5001/video_feed`). This is a **web-only component** (uses HTML elements) and cannot run in React Native. It was likely ported from the companion web application.

---

## 6. Theme System

### 6.1 `stitchPalette` Design Tokens

**File**: `src/theme/stitchPalette.ts`

The app uses a single exported constant object as its design token system:

```ts
export const stitchPalette = {
  bg: "#091122",           // Page background (deep navy)
  bgDeep: "#050b14",       // Deeper background layer
  surface: "#101b31",      // Card / surface background
  surfaceAlt: "#0f1a2a",   // Alternative surface (slightly lighter)
  surfaceMuted: "#18243d", // Muted surface
  borderSoft: "rgba(184,140,69,0.32)",    // Soft amber border
  borderStrong: "rgba(246,192,106,0.26)", // Stronger amber border
  accent: "#f6b11c",       // Primary amber accent (buttons, active states)
  accentSoft: "#f6c06a",   // Softer amber for text/labels
  accentHover: "#ffbf3f",  // Hover state accent
  success: "#4dd7a5",      // Green (confirmed status)
  warning: "#f4ac1c",      // Amber (warning/pending status)
  danger: "#ef7c54",       // Red-orange (error/logout)
  info: "#79a8ff",         // Blue (info status)
  text: "#f8fafc",         // Primary text (near white)
  textSoft: "#e2e8f0",     // Secondary text
  textMuted: "#cbd5e1",    // Muted text (subtitles)
  textSubtle: "#94a3b8",   // Subtle/disabled text
  ink: "#111827",          // Dark text (on accent backgrounds)
};
```

> Note: The Navigation container also defines a separate theme object in `src/App.tsx`, partially duplicating these values. The two systems are not linked.

---

## 7. TypeScript Configuration

**File**: `tsconfig.json`

The TypeScript compiler **only includes** the following paths:

```json
"include": [
  "App.tsx", "index.tsx", "src/App.tsx",
  "src/navigation/**/*", "src/screens/**/*",
  "src/components/layout/**/*", "src/types/**/*"
]
```

The following directories are **explicitly excluded** from type checking:

```json
"exclude": [
  "src/components/pages/**/*",
  "src/components/ui/**/*",
  "src/lib/**/*",
  "src/hooks/**/*", "src/helpers/**/*",
  "src/services/**/*", "src/store/**/*"
]
```

**This means**: `src/services/portalApi.ts`, `src/lib/*.ts`, and `src/components/ui/*.tsx` are intentionally **not type-checked by the TypeScript compiler**. This is a deliberate workaround to avoid type errors from web-ported files that use browser APIs (`localStorage`, `window`, `document`, `EventSource`) and web-only libraries (`lucide-react`, `radix-ui`, `clsx`).

---

## 8. Known Issues & Areas for Improvement

### 🐛 Bugs

| ID | Location | Issue |
|---|---|---|
| B-01 | `YardScreen.tsx` | Summary stat cards (24 free, 18 occupied, 6 reserved) are **hardcoded** and do not reflect the actual fetched `spots` array. |
| B-02 | `SettingsScreen.tsx` | "Help Center" and "Terms of Service" links navigate to `"Notifications"`, a tab route that **does not exist** in `RootTabParamList`. This will throw a runtime navigation warning. |
| B-03 | `SettingsScreen.tsx` | Logout button navigates to `"Dashboard"` but does **not clear any auth/session state**. No actual authentication flow exists. |
| B-04 | `use-realtime-spots.ts` | Imports from `"@/app/client/parking/parking-map"` — a **Next.js path alias** that does not resolve in the Expo/React Native context. This file cannot be used as-is. |
| B-05 | `use-sse.ts` | Uses `EventSource` which is a **browser-only API**. On React Native (without a polyfill), this will throw `ReferenceError: EventSource is not defined`. |
| B-06 | `lib/theme-provider.tsx` | Uses `localStorage` and `window.matchMedia` — **browser-only APIs**. Cannot run in React Native. |
| B-07 | `components/ui/video-stream.tsx` | Uses HTML elements (`<div>`, `<img>`, `<button>`) — **web-only JSX**. Cannot render in React Native. |
| B-08 | `darkMode` toggle in `SettingsScreen` | The `darkMode` switch toggles local state but has **no effect on the actual app theme**. |

### 🔧 Refactoring Opportunities

| ID | Area | Recommendation |
|---|---|---|
| R-01 | **Code duplication in styles** | Many screens hardcode identical color values (e.g., `"#0f1a2a"`, `"#1f2937"`) instead of using `stitchPalette`. Enforce palette usage uniformly. |
| R-02 | **Web-ported code in `lib/` and `components/ui/`** | Move or delete `video-stream.tsx`, `theme-provider.tsx`, `use-sse.ts`, `use-realtime-spots.ts`, `utils.ts`, and `button.tsx` from the native project, or refactor them for React Native. |
| R-03 | **`services/portalApi.ts`** | Replace mock data with real HTTP calls using the installed `axios` client. Add environment variable support for the base URL. |
| R-04 | **Authentication** | No auth layer exists. Add login/session management using Zustand (already installed) or Expo SecureStore for persisting tokens. |
| R-05 | **Error & Loading states** | Screens use `useQuery` but do not handle `isLoading` or `isError` states — no skeleton loaders or error messages are displayed while data is fetching. |
| R-06 | **Navigation type safety** | `navigation.navigate("QRScanner" as never)` and `navigation.navigate("Notifications" as never)` use `as never` casts to bypass type safety. Use proper typed navigation with `useNavigation<NavigationProp<...>>`. |
| R-07 | **Yard screen hardcoded stats** | Derive the summary counts (Free/Occupied/Reserved) from the `spots` array rather than hardcoding. |
| R-08 | **`tsconfig.json` exclusions** | The broad exclusion of `src/services`, `src/lib`, and `src/components/ui` suppresses type errors but also hides real bugs. Refactor web-ported files so they can be included in type checking. |
| R-09 | **`QRScannerNative` (POC)** | The vision-camera POC skeleton in `src/components/qr/` should either be completed and integrated, or removed to avoid confusion. |
| R-10 | **`useRealtimeSpots` hook** | Refactor to use the local `YardSpot` type and wire it to the `YardScreen` using SSE or polling via `useQuery`'s `refetchInterval`. |
| R-11 | **Navigation theme duplication** | The `DarkTheme` override in `src/App.tsx` partially duplicates `stitchPalette`. Consider deriving the Navigation theme from the palette. |
| R-12 | **Notification tab** | `RootTabParamList` defines a `"Notifications"` tab but no screen is registered for it in `AppNavigator.tsx`. Either add the screen or remove it from the type. |

### 🚀 Feature Gaps (Planned But Not Yet Implemented)

| Feature | Evidence | Status |
|---|---|---|
| Real-time yard spot updates | `use-realtime-spots.ts`, `use-sse.ts`, `astar.ts` | Infrastructure present, not wired |
| Yard pathfinding / navigation | `astar.ts` (full implementation) | Algorithm ready, no UI |
| Video camera feed | `video-stream.tsx` | Web-only, needs native port |
| Push notifications | Toggle in Settings | UI only, no native implementation |
| Authentication / Login | Logout button, hardcoded profile | Not implemented |
| Real API backend | `axios` installed, `portalApi.ts` is mock | Stub only |
