const fs = require('fs');
let s = 'src/modules/appointments/screens/AppointmentsScreen.tsx';
let content = fs.readFileSync(s, 'utf8');

content = content.replace(/from\s+['"]\.\.\/\.\.\/components\/QueryStateHandler['"]/g, "from '@/shared/components/query-state-handler'");

fs.writeFileSync(s, content, 'utf8');
