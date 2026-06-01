import os

filepath = r'D:\SWP\swp391-su26-ai-audit-project-swp391_se20a04_group-03-1\src\frontend\src\app\admin\appointments\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if 'import { AsyncDriverSelect }' not in content:
    content = content.replace('import { Button } from"@/components/ui/button";', 'import { Button } from "@/components/ui/button";\nimport { AsyncDriverSelect } from "@/components/AsyncDriverSelect";')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
print('Added import')
