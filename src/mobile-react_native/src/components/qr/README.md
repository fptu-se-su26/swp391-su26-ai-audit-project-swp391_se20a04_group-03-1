QR Scanner Native POC

This is a minimal POC component `QRScannerNative.tsx` that checks camera permission and simulates a scan.

Installation (recommended):

1. Add vision camera:

```bash
yarn add react-native-vision-camera
# or
npm install react-native-vision-camera
```

2. Follow native installation steps from https://mrousavy.com/react-native-vision-camera/ (Android/iOS configuration, permissions, and codegen if using frame processors).

3. Optionally add `vision-camera-code-scanner` or implement a frame processor to decode QR codes.

Notes:

- This POC intentionally lazy-loads the library so the project compiles even before native install.
- After installing, replace the simulated button with real `Camera` rendering and frame processing.
