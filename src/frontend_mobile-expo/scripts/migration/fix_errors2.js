const fs = require('fs');
function replace(path, search, replaceStr) {
    if (fs.existsSync(path)) {
        let content = fs.readFileSync(path, 'utf8');
        content = content.replace(search, replaceStr);
        fs.writeFileSync(path, content, 'utf8');
    }
}

// 1. app/index.tsx
replace('src/app/index.tsx', /href='\/\(tabs\)'/g, "href={'/(tabs)' as any}");

// 2. Remove app-tabs.web.tsx since it's boilerplate
if (fs.existsSync('src/components/app-tabs.web.tsx')) {
    fs.unlinkSync('src/components/app-tabs.web.tsx');
}
if (fs.existsSync('src/components/app-tabs.tsx')) {
    fs.unlinkSync('src/components/app-tabs.tsx');
}

// 3. AppointmentsScreen.tsx
replace('src/modules/appointments/screens/AppointmentsScreen.tsx', /import type \{ RootStackParamList, RootTabParamList \} from "\.\.\/\.\.\/navigation\/AppNavigator";\n?/g, '');
replace('src/modules/appointments/screens/AppointmentsScreen.tsx', /navigation\.getParent.*\n.*navigate\("MyQRCode"/g, 'router.push({ pathname: "/modal/qr" as any');

// 4. SettingsScreen.tsx
replace('src/modules/settings/screens/SettingsScreen.tsx', /type Props = BottomTabScreenProps<RootTabParamList, "Settings">;\n?/g, '');
replace('src/modules/settings/screens/SettingsScreen.tsx', /export default function SettingsScreen\(\{\s*navigation\s*\}\s*:\s*Props\)\s*\{/g, 'import { useRouter } from "expo-router";\nexport default function SettingsScreen() {\n  const router = useRouter();');

// 5. snackbar.tsx
replace('src/shared/components/snackbar.tsx', /lucide-react-native-native/g, 'lucide-react-native');

// 6. use-realtime-spots.ts
replace('src/shared/hooks/use-realtime-spots.ts', /import \{ AStar \} from '@\/app\/client\/parking\/parking-map';/g, 'import { AStar } from "@/shared/utils/astar";');
