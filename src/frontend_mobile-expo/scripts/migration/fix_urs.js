const fs = require('fs');
let urs = 'src/shared/hooks/use-realtime-spots.ts';
let ursContent = fs.readFileSync(urs, 'utf8');

// Mock AStar and Spot interfaces
ursContent = ursContent.replace(/import \{ Spot \} from '@\/app\/client\/parking\/parking-map';/g, 'export type Spot = any;');
ursContent = ursContent.replace(/import \{ AStar \} from '@\/app\/client\/parking\/parking-map';/g, '');

ursContent += '\nclass AStar { constructor(grid: any) {} findPath(start: any, end: any) { return []; } }\n';

fs.writeFileSync(urs, ursContent, 'utf8');
