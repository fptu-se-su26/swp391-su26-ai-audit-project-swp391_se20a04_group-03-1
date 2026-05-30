const fs = require('fs');

// SettingsScreen
let settingsPath = 'src/modules/settings/screens/SettingsScreen.tsx';
if (fs.existsSync(settingsPath)) {
    let code = fs.readFileSync(settingsPath, 'utf8');
    code = code.replace(/import type \{ RootTabParamList \} from "\.\.\/\.\.\/navigation\/AppNavigator";/, '');
    code = code.replace(/import type \{ BottomTabScreenProps \} from "@react-navigation\/bottom-tabs";/, 'import { useRouter } from "expo-router";');
    code = code.replace(/type Props = BottomTabScreenProps<RootTabParamList, "Settings">;/, '');
    code = code.replace(/export default function SettingsScreen\(\{ navigation \}: Props\) \{/, 'export default function SettingsScreen() {\n  const router = useRouter();');
    fs.writeFileSync(settingsPath, code, 'utf8');
}

// MyQRCodeScreen
let qrPath = 'src/modules/qr/screens/MyQRCodeScreen.tsx';
if (fs.existsSync(qrPath)) {
    let code = fs.readFileSync(qrPath, 'utf8');
    code = code.replace(/import type \{ NativeStackScreenProps \} from "@react-navigation\/native-stack";/, 'import { useLocalSearchParams, useRouter } from "expo-router";');
    code = code.replace(/import type \{ RootStackParamList \} from "\.\.\/\.\.\/navigation\/AppNavigator";/, '');
    code = code.replace(/type Props = NativeStackScreenProps<RootStackParamList, "MyQRCode">;/, '');
    code = code.replace(/export default function MyQRCodeScreen\(\{ route, navigation \}: Props\) \{/, 'export default function MyQRCodeScreen() {\n  const router = useRouter();\n  const { appointmentCode, driverName, licensePlate, timeSlot } = useLocalSearchParams<any>();');
    code = code.replace(/const \{ appointmentCode, driverName, licensePlate, timeSlot \} = route\.params;/, '');
    code = code.replace(/navigation\.goBack\(\)/, 'router.back()');
    fs.writeFileSync(qrPath, code, 'utf8');
}
