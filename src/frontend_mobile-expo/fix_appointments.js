const fs = require('fs');
let s = 'src/modules/appointments/screens/AppointmentsScreen.tsx';
let content = fs.readFileSync(s, 'utf8');

// fix imports
content = content.replace(/from\s+['"]\.\.\/\.\.\/components\/layout\/ScreenShell['"]/g, "from '@/shared/components/layout/ScreenShell'");
content = content.replace(/from\s+['"]\.\.\/\.\.\/services\/portalApi['"]/g, "from '@/core/api/portal-api'");
content = content.replace(/from\s+['"]\.\.\/\.\.\/theme\/stitchPalette['"]/g, "from '@/core/theme'");
content = content.replace(/import ScreenShell from/g, 'import { ScreenShell } from');

// clean nav
content = content.replace(/import type \{ BottomTabScreenProps \} from "@react-navigation\/bottom-tabs";\n?/g, '');
content = content.replace(/import type \{ RootStackParamList, RootTabParamList \} from "\.\.\/\.\.\/navigation\/AppNavigator";\n?/g, '');
content = content.replace(/import \{ useRouter \} from 'expo-router';\n?/g, ''); // prevent duplicate
content = content.replace(/type Props = BottomTabScreenProps<RootTabParamList, "[a-zA-Z]+">;\n?/g, '');
content = content.replace(/export default function ([a-zA-Z]+Screen)\(\s*\{.*\}\s*:\s*Props\)\s*\{/g, "import { useRouter } from 'expo-router';\nexport default function () {\n  const router = useRouter();");

// specific fix
content = content.replace(/navigation\s*\.getParent.*\n\s*\?\.navigate\("MyQRCode"/g, 'router.push({ pathname: "/modal/qr" as any');
content = content.replace(/import type \{ NavigationProp \} from "@react-navigation\/native";\n?/g, '');

fs.writeFileSync(s, content, 'utf8');
