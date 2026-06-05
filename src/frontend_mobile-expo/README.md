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

- **`src/app/`**: Used by Expo Router for file-based routing and entry points. This layer handles navigation logic.
- **`src/modules/`**: Feature-specific slices containing their own components, hooks, services, and local state (e.g., `appointments`, `dashboard`, `yard`).
- **`src/shared/`**: Global resources shared across the entire application.
  - `api/`: Axios client, interceptors, and API mock files (`portal-api.ts`).
  - `components/ui/`: Reusable, generic UI components (Buttons, Cards, Inputs).
  - `config/`: Configuration files (e.g., `navigation.ts`).
  - `hooks/`: Global custom React hooks.
  - `providers/`: Context providers.
  - `theme/`: Design tokens, colors, typography.
  - `types/`: Global TypeScript definitions.
  - `utils/`: Helper functions.
- **`src/constants/`**: Hardcoded data, layout constants.
- **`assets/`**: Static assets like images and fonts.
- **`scripts/migration/`**: Contains legacy scripts used during the React Native to Expo migration.

### 📜 FSD Guidelines for Developers
- **Do not mix domains**: A module (e.g., `dashboard`) should not directly import from another module (e.g., `appointments`). If they need to share logic, extract it to `src/shared`.
- **UI Components**: If a component is specific to a feature (e.g., `AppointmentCard`), place it in `src/modules/appointments/components/`. If it is generic (e.g., `Card`), place it in `src/shared/components/ui/`.
- **Routing**: Keep UI clean. Only `src/app` should define routes. Use standard exports from `src/modules/*/screens/` to map routes.
