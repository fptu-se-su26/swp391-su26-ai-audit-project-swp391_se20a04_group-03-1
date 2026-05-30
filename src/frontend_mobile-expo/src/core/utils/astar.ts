/**
 * A* Pathfinding Algorithm
 *
 * Grid-based shortest path implementation using Manhattan distance heuristic.
 * Used by the yard module to find optimal routes between spots.
 *
 * Grid encoding: 0 = walkable, 1 = blocked.
 */

export interface Point {
  x: number;
  y: number;
}

interface AStarNode {
  p: Point;
  f: number;
  g: number;
  cameFrom?: string;
}

function heuristic(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(p: Point, grid: number[][]): Point[] {
  const result: Point[] = [];
  const dirs: Point[] = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  for (const d of dirs) {
    const nx = p.x + d.x;
    const ny = p.y + d.y;
    if (
      ny >= 0 &&
      ny < grid.length &&
      nx >= 0 &&
      nx < (grid[0]?.length ?? 0)
    ) {
      if (grid[ny]![nx] === 0) {
        result.push({ x: nx, y: ny });
      }
    }
  }
  return result;
}

/**
 * Find the shortest path between `start` and `goal` on the given grid.
 * Returns an array of Points from start to goal, or `null` if no path exists.
 */
export function findPath(
  start: Point,
  goal: Point,
  grid: number[][],
): Point[] | null {
  const open = new Map<string, AStarNode>();
  const key = (p: Point) => `${p.x},${p.y}`;

  open.set(key(start), { p: start, f: heuristic(start, goal), g: 0 });
  const closed = new Set<string>();

  while (open.size > 0) {
    // Pick node with lowest f score
    let currentKey: string | null = null;
    let currentNode: AStarNode | null = null;

    for (const [k, v] of open) {
      if (!currentNode || v.f < currentNode.f) {
        currentKey = k;
        currentNode = v;
      }
    }

    if (!currentNode || !currentKey) break;

    const current = currentNode.p;

    // Goal reached — reconstruct path
    if (current.x === goal.x && current.y === goal.y) {
      const path: Point[] = [];
      let k: string | undefined = currentKey;

      while (k) {
        const parts = k.split(',');
        path.push({ x: parseInt(parts[0]!, 10), y: parseInt(parts[1]!, 10) });
        const node: AStarNode | undefined = open.get(k);
        if (!node?.cameFrom) break;
        k = node.cameFrom;
      }

      return path.reverse();
    }

    open.delete(currentKey);
    closed.add(currentKey);

    for (const nb of getNeighbors(current, grid)) {
      const nk = key(nb);
      if (closed.has(nk)) continue;

      const tentativeG = currentNode.g + 1;
      const existing = open.get(nk);

      if (!existing || tentativeG < existing.g) {
        open.set(nk, {
          p: nb,
          g: tentativeG,
          f: tentativeG + heuristic(nb, goal),
          cameFrom: currentKey,
        });
      }
    }
  }

  return null;
}
