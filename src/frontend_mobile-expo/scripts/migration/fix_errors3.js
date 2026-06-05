const fs = require('fs');

// SettingsScreen missing import
let s = 'src/modules/settings/screens/SettingsScreen.tsx';
let c = fs.readFileSync(s, 'utf8');
if (!c.includes("import { useRouter }")) {
    c = 'import { useRouter } from "expo-router";\n' + c;
    fs.writeFileSync(s, c, 'utf8');
}

// AppointmentsScreen remove getParent
let a = 'src/modules/appointments/screens/AppointmentsScreen.tsx';
let ac = fs.readFileSync(a, 'utf8');
ac = ac.replace(/import type \{ RootStackParamList, RootTabParamList \} from "\.\.\/\.\.\/navigation\/AppNavigator";\n?/g, '');
ac = ac.replace(/navigation\n\s*\.getParent.*\n\s*\?\.navigate\("MyQRCode"/g, 'router.push({ pathname: "/modal/qr" as any');
fs.writeFileSync(a, ac, 'utf8');

// use-realtime-spots.ts
let ur = 'src/shared/hooks/use-realtime-spots.ts';
let urc = fs.readFileSync(ur, 'utf8');
urc = urc.replace(/import \{ AStar \} from '@\/app\/client\/parking\/parking-map';/g, 'import { AStar } from "@/shared/utils/astar";');
fs.writeFileSync(ur, urc, 'utf8');
