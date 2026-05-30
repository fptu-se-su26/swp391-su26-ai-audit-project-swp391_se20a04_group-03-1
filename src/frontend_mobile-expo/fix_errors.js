const fs = require('fs');

function replace(path, search, replaceStr) {
    if (fs.existsSync(path)) {
        let content = fs.readFileSync(path, 'utf8');
        content = content.replace(search, replaceStr);
        fs.writeFileSync(path, content, 'utf8');
    }
}

// 1. ScreenShell default export -> named export
const screens = [
    'src/modules/appointments/screens/AppointmentsScreen.tsx',
    'src/modules/dashboard/screens/DashboardScreen.tsx',
    'src/modules/notifications/screens/NotificationsScreen.tsx',
    'src/modules/settings/screens/SettingsScreen.tsx',
    'src/modules/yard/screens/YardScreen.tsx'
];
for (let s of screens) {
    replace(s, /import ScreenShell from/g, 'import { ScreenShell } from');
}

// 2. SettingsScreen RootTabParamList
replace('src/modules/settings/screens/SettingsScreen.tsx', /type Props = BottomTabScreenProps<RootTabParamList, "Settings">;/g, '');
replace('src/modules/settings/screens/SettingsScreen.tsx', /export default function SettingsScreen\(\{ navigation \}: Props\) \{/g, 'export default function SettingsScreen() { const router = useRouter();');

// 3. absoluteFill
replace('src/modules/qr/components/QRScannerNative.tsx', /StyleSheet\.absoluteFillObject/g, 'StyleSheet.absoluteFill');
replace('src/shared/components/video-stream.tsx', /StyleSheet\.absoluteFillObject/g, 'StyleSheet.absoluteFill');

// 4. snackbar.tsx
replace('src/shared/components/snackbar.tsx', /from "\.\/button"/g, 'from "./Button"');
replace('src/shared/components/snackbar.tsx', /onClick=/g, 'onPress=');
replace('src/shared/components/snackbar.tsx', /lucide-react/g, 'lucide-react-native');

// 5. core/theme/index.ts
let themeIndex = 'src/core/theme/index.ts';
if (fs.existsSync(themeIndex)) {
    let content = fs.readFileSync(themeIndex, 'utf8');
    if (!content.includes('stitchPalette')) {
        content += '\nexport * from "./stitchPalette";\n';
        fs.writeFileSync(themeIndex, content, 'utf8');
    }
}

// 6. use-realtime-spots.ts
replace('src/shared/hooks/use-realtime-spots.ts', /from '@\/app\/client\/parking\/parking-map'/g, 'from "@/shared/utils/astar"');
