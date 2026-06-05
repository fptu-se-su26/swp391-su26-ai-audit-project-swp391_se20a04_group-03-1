const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, '../../src');

const replacements = [
  { regex: /from\s+['"]@\/core\/(.*?)['"]/g, replace: 'from \'@/shared/$1\'' },
  { regex: /import\s+(.*?)\s+from\s+['"]@\/core\/(.*?)['"]/g, replace: 'import $1 from \'@/shared/$2\'' },
  { regex: /from\s+['"]@\/components\/(.*?)['"]/g, replace: 'from \'@/shared/components/ui/$1\'' },
  { regex: /import\s+(.*?)\s+from\s+['"]@\/components\/(.*?)['"]/g, replace: 'import $1 from \'@/shared/components/ui/$2\'' },
  { regex: /from\s+['"]@\/hooks\/(.*?)['"]/g, replace: 'from \'@/shared/hooks/$1\'' },
  { regex: /import\s+(.*?)\s+from\s+['"]@\/hooks\/(.*?)['"]/g, replace: 'import $1 from \'@/shared/hooks/$2\'' },
  { regex: /from\s+['"]@\/navigation['"]/g, replace: 'from \'@/shared/config/navigation\'' },
  { regex: /import\s+(.*?)\s+from\s+['"]@\/navigation['"]/g, replace: 'import $1 from \'@/shared/config/navigation\'' },
  { regex: /from\s+['"]@\/navigation\/(.*?)['"]/g, replace: 'from \'@/shared/config/navigation\'' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const { regex, replace } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(directory);
console.log('Done!');
