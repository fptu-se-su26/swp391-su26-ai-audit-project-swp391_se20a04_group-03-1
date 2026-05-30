# LogiPort Mobile - Expo Frontend

Welcome to the LogiPort mobile application! This project is a complete migration of our legacy React Native codebase to a modern **Expo (SDK 56)** and **React Native (0.85)** stack.

## 🚀 Technologies Used

- **Framework:** [Expo SDK 56](https://expo.dev/) & React Native 0.85
- **Routing:** [React Navigation 7](https://reactnavigation.org/) (Custom structure) & Expo Router
- **State Management:** [Zustand 5](https://zustand-demo.pmnd.rs/) (Client State) & [TanStack Query 5](https://tanstack.com/query/latest) (Server State/API Caching)
- **Networking:** `axios` with centralized interceptors
- **Styling/UI:** Tailwind CSS (via `nativewind` or custom global.css), `lucide-react-native`, `react-native-paper`
- **Animations:** React Native Reanimated 4, Moti, Lottie
- **Security:** `expo-secure-store` for JWT persistence

## 🛠 Getting Started

### 1. Install Dependencies
Ensure you have Node.js installed, then run:

```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the root based on `.env.example` (if available) and specify the API Base URL:
```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

### 3. Start the Development Server
```bash
npm start
# or
npx expo start
```
Press `i` to open in iOS Simulator, `a` for Android Emulator, or scan the QR code with the **Expo Go** app on your physical device.

---

## 📁 Modular Directory Structure (FSD Inspired)

We organize the codebase using a **Modular/Feature-Sliced Design (FSD)** approach to keep concerns separated and scalable:

- **`app/`**: Used by Expo Router for file-based routing and entry points.
- **`components/`**: Reusable, generic UI components (Buttons, Cards, Inputs).
- **`core/`**: Application-wide configurations.
  - `api/`: Axios client, interceptors, and API mock files (`portal-api.ts`).
  - `theme/`: Design tokens, colors, typography.
- **`modules/`**: Feature-specific slices containing their own components, hooks, and services (e.g., `appointments`, `dashboard`, `yard`).
- **`shared/`**: Shared types, utilities, and helper functions used across modules.
- **`navigation/`**: Stack and tab navigator configurations.
- **`constants/`**: Hardcoded data, layout constants.
- **`hooks/`**: Global custom React hooks.
