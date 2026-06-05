const fs = require('fs');

function cleanNavigation(path) {
    if (fs.existsSync(path)) {
        let content = fs.readFileSync(path, 'utf8');
        content = content.replace(/import type \{ BottomTabScreenProps \} from "@react-navigation\/bottom-tabs";\n?/g, '');
        content = content.replace(/import type \{ RootTabParamList \} from "\.\.\/\.\.\/navigation\/AppNavigator";\n?/g, '');
        content = content.replace(/import \{ useRouter \} from 'expo-router';\n?/g, ''); // prevent duplicate
        content = content.replace(/type Props = BottomTabScreenProps<RootTabParamList, "[a-zA-Z]+">;\n?/g, '');
        content = content.replace(/export default function ([a-zA-Z]+Screen)\(\s*\{.*\}\s*:\s*Props\)\s*\{/g, "import { useRouter } from 'expo-router';\nexport default function () {\n  const router = useRouter();");
        fs.writeFileSync(path, content, 'utf8');
    }
}

const screens = [
    'src/modules/appointments/screens/AppointmentsScreen.tsx',
    'src/modules/dashboard/screens/DashboardScreen.tsx',
    'src/modules/notifications/screens/NotificationsScreen.tsx',
    'src/modules/yard/screens/YardScreen.tsx'
];
for (let s of screens) {
    cleanNavigation(s);
}
