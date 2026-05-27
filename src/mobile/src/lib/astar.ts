export type Point = { x: number; y: number };

function heuristic(a: Point, b: Point) {
  // Manhattan distance
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function neighbors(p: Point, grid: number[][]) {
  const res: Point[] = [];
  const dirs = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  for (const d of dirs) {
    const nx = p.x + d.x;
    const ny = p.y + d.y;
    if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length) {
      if (grid[ny][nx] === 0) res.push({ x: nx, y: ny });
    }
  }
  return res;
}

export function findPath(
  start: Point,
  goal: Point,
  grid: number[][],
): Point[] | null {
  const open: Map<
    string,
    { p: Point; f: number; g: number; cameFrom?: string }
  > = new Map();
  const key = (p: Point) => `${p.x},${p.y}`;

  open.set(key(start), { p: start, f: heuristic(start, goal), g: 0 });
  const closed = new Set<string>();

  while (open.size > 0) {
    // pick lowest f
    let currentKey: string | null = null;
    let currentNode: {
      p: Point;
      f: number;
      g: number;
      cameFrom?: string;
    } | null = null;
    for (const [k, v] of open) {
      if (!currentNode || v.f < currentNode.f) {
        currentKey = k;
        currentNode = v;
      }
    }
    if (!currentNode || !currentKey) break;

    const current = currentNode.p;
    if (current.x === goal.x && current.y === goal.y) {
      // reconstruct path
      const path: Point[] = [];
      let k = currentKey;
      while (k) {
        const parts = k.split(",");
        path.push({ x: parseInt(parts[0], 10), y: parseInt(parts[1], 10) });
        const node = open.get(k) || null;
        if (!node || !node.cameFrom) break;
        k = node.cameFrom;
      }
      return path.reverse();
    }

    open.delete(currentKey);
    closed.add(currentKey);

    for (const nb of neighbors(current, grid)) {
      const nk = key(nb);
      if (closed.has(nk)) continue;
      const tentative_g = currentNode.g + 1;
      const existing = open.get(nk);
      if (!existing || tentative_g < existing.g) {
        open.set(nk, {
          p: nb,
          g: tentative_g,
          f: tentative_g + heuristic(nb, goal),
          cameFrom: currentKey,
        });
      }
    }
  }

  return null;
}
