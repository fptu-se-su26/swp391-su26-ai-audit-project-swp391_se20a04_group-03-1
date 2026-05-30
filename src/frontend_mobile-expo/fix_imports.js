const fs = require('fs');
const glob = require('glob'); // Note: running without glob if not installed, but let's use standard fs
const path = require('path');

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace layout
    content = content.replace(/from\s+['"]\.\.\/\.\.\/components\/layout\/ScreenShell['"]/g, "from '@/shared/components/layout/ScreenShell'");
    
    // Replace UI components
    content = content.replace(/from\s+['"]\.\.\/\.\.\/components\/ui\/(.*?)['"]/g, "from '@/shared/components/'");
    
    // Replace services
    content = content.replace(/from\s+['"]\.\.\/\.\.\/services\/portalApi['"]/g, "from '@/core/api/portal-api'");
    
    // Replace theme
    content = content.replace(/from\s+['"]\.\.\/\.\.\/theme\/stitchPalette['"]/g, "from '@/core/theme'");
    
    // Replace lucide-react with lucide-react-native
    content = content.replace(/from\s+['"]lucide-react['"]/g, "from 'lucide-react-native'");

    fs.writeFileSync(filePath, content, 'utf8');
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            replaceInFile(fullPath);
        }
    }
}

walkDir('./src/modules');
walkDir('./src/shared');
