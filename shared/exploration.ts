export interface Point {
  x: number;
  y: number;
}
export type LandmarkKind =
  | "portal"
  | "cache"
  | "shrine"
  | "rest"
  | "npc"
  | "arena";
export interface Landmark extends Point {
  id: string;
  kind: LandmarkKind;
  name: string;
  target?: number;
  character?: string;
  description: string;
}
export interface Region {
  id: number;
  biome: "grove" | "frost" | "ember" | "blood" | "stone" | "mist";
  landmarks: Landmark[];
  obstacles: { x: number; y: number; r: number }[];
}
export const MAP = {
  width: 2800,
  height: 1900,
  minX: 55,
  minY: 55,
  maxX: 2745,
  maxY: 1845,
  spawn: { x: 500, y: 550 },
  arena: { x: 500, y: 450 },
  camp: { x: 500, y: 295 },
};
const wrap = (n: number) => ((n + 17) % 18) + 1;
const regionCache = new Map<number, Region>();
export function regionFor(id: number): Region {
  const cached = regionCache.get(id);
  if (cached) return cached;
  const landmarks: Landmark[] = [
    {
      id: "portal-north",
      kind: "portal",
      name: "Cổng sương phía bắc",
      x: 500,
      y: 155,
      target: wrap(id + 1),
      description: "Một ngả đường sang miền kế bên.",
    },
    {
      id: "portal-west",
      kind: "portal",
      name: "Bến Vong Xuyên",
      x: 240,
      y: 1550,
      target: wrap(id - 1),
      description: "Qua bến để tìm một lối đi khác.",
    },
    {
      id: "portal-east",
      kind: "portal",
      name: "Khe nứt âm giới",
      x: 2450,
      y: 1450,
      target: wrap(id + 6),
      description: "Lối tắt nối tới một miền xa hơn.",
    },
    {
      id: "camp",
      kind: id === 18 ? "npc" : "rest",
      name: id === 18 ? "Mạnh Bà" : "Trạm nghỉ Đèn Hồn",
      x: 500,
      y: 295,
      character: id === 18 ? "manh-ba" : "dia-tang",
      description:
        id === 18
          ? "Bát canh quên lãng đang chờ người muốn bắt đầu một vòng ngao du mới."
          : "Nghỉ chân, hồi thể lực và nghe chuyện của người cùng đường.",
    },
    {
      id: "arena",
      kind: "arena",
      name: "Sân quậy âm ty",
      x: 500,
      y: 450,
      description:
        "Kéo một vong đang choáng tới đây để trêu bằng cảnh hình phạt của miền này.",
    },
    {
      id: "keeper",
      kind: "npc",
      name: "Quỷ sứ gác đường",
      x: 1330 + (id % 3) * 95,
      y: 660,
      character: ["quy-su", "nguu-dau", "ma-dien"][id % 3],
      description: [
        "Tôi có bản đồ, nhưng lần nào cũng cầm ngược!",
        "Ở đây có đường tắt. Không có đường tắt hồi chiêu đâu nhé.",
        "Rương ở sau rừng đấy. Tôi chỉ đường, không khuân hộ!",
      ][id % 3],
    },
    {
      id: "shrine",
      kind: "shrine",
      name: "Đài ký ức",
      x: 1720 + (id % 2) * 150,
      y: 1120,
      description: "Một mốc khám phá lưu lại dấu chân của bạn.",
    },
    {
      id: "ruin",
      kind: "shrine",
      name: "Phế tích Vọng Âm",
      x: 2220,
      y: 510 + (id % 3) * 80,
      description: "Lắng nghe một câu chuyện còn sót lại trong gió.",
    },
    {
      id: "cache-a",
      kind: "cache",
      name: "Rương đèn lạc",
      x: 870 + (id % 3) * 75,
      y: 880,
      description: "Đốm hồn bên trong sẽ được ghi vào túi hành trang.",
    },
    {
      id: "cache-b",
      kind: "cache",
      name: "Rương dưới tán sương",
      x: 1460,
      y: 1530 - (id % 2) * 100,
      description: "Một kho nhỏ cho những người chịu khó đi xa.",
    },
    {
      id: "cache-c",
      kind: "cache",
      name: "Rương của quỷ đãng trí",
      x: 2420,
      y: 1060,
      description: "Chủ rương chắc đã quên mình giấu ở đây.",
    },
  ];
  const obstacles = Array.from({ length: 26 }, (_, i) => ({
    x: 170 + ((i * 419 + id * 131) % 2400),
    y: 230 + ((i * 283 + id * 91) % 1430),
    r: 28 + (i % 3) * 8,
  })).filter(
    (o) =>
      landmarks.every((p) => Math.hypot(p.x - o.x, p.y - o.y) > 160) &&
      Math.hypot(o.x - 500, o.y - 550) > 200 &&
      !(o.x < 720 && o.y < 720),
  );
  const result: Region = {
    id,
    biome:
      id === 8
        ? "frost"
        : id === 6 || id === 9 || id === 16
          ? "ember"
          : id === 13
            ? "blood"
            : id === 3 || id === 10
              ? "grove"
              : id === 4 || id === 14
                ? "mist"
                : "stone",
    landmarks,
    obstacles,
  };
  regionCache.set(id, result);
  return result;
}
export const pointKey = (region: number, id: string) => `${region}:${id}`;
export const near = (a: Point, b: Point, r = 105) =>
  Math.hypot(a.x - b.x, a.y - b.y) <= r;
export function canStand(region: number | Region, p: Point, radius = 15) {
  return (
    p.x >= MAP.minX &&
    p.x <= MAP.maxX &&
    p.y >= MAP.minY &&
    p.y <= MAP.maxY &&
    (typeof region === "number" ? regionFor(region) : region).obstacles.every(
      (o) => Math.hypot(p.x - o.x, p.y - o.y) > o.r + radius,
    )
  );
}
export function clearSegment(region: number | Region, a: Point, b: Point) {
  if (!canStand(region, b)) return false;
  const steps = Math.ceil(Math.hypot(a.x - b.x, a.y - b.y) / 12);
  for (let i = 1; i <= steps; i++)
    if (
      !canStand(region, {
        x: a.x + ((b.x - a.x) * i) / steps,
        y: a.y + ((b.y - a.y) * i) / steps,
      })
    )
      return false;
  return true;
}
/** Shared navigation: direct paths first, then a small eight-neighbour A* grid. */
export function routeTo(
  region: number | Region,
  from: Point,
  to: Point,
): Point[] {
  const target = {
    x: Math.max(MAP.minX, Math.min(MAP.maxX, to.x)),
    y: Math.max(MAP.minY, Math.min(MAP.maxY, to.y)),
  };
  if (!canStand(region, target)) return [];
  if (clearSegment(region, from, target)) return [target];
  const step = 55,
    cols = Math.ceil(MAP.width / step),
    rows = Math.ceil(MAP.height / step),
    index = (x: number, y: number) => y * cols + x,
    point = (n: number) => ({
      x: (n % cols) * step + step / 2,
      y: Math.floor(n / cols) * step + step / 2,
    });
  const nearest = (p: Point) => {
    const x = Math.round((p.x - step / 2) / step),
      y = Math.round((p.y - step / 2) / step);
    let result = -1,
      d = Infinity;
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx,
          ny = y + dy;
        if (nx < 1 || ny < 1 || nx >= cols - 1 || ny >= rows - 1) continue;
        const n = index(nx, ny),
          q = point(n),
          v = Math.hypot(q.x - p.x, q.y - p.y);
        if (v < d && canStand(region, q) && clearSegment(region, p, q)) {
          d = v;
          result = n;
        }
      }
    return result;
  };
  const start = nearest(from),
    goal = nearest(target);
  if (start < 0 || goal < 0) return [];
  const open = new Set([start]),
    came = new Map<number, number>(),
    cost = new Map([[start, 0]]),
    score = new Map([[start, 0]]);
  let count = 0;
  while (open.size && count++ < 2000) {
    let current = -1,
      best = Infinity;
    for (const n of open) {
      const s = score.get(n) ?? Infinity;
      if (s < best) {
        best = s;
        current = n;
      }
    }
    if (current === goal) {
      const path: Point[] = [target];
      for (let n = goal; n !== start; n = came.get(n)!) path.unshift(point(n));
      path.unshift(point(start));
      const simplified: Point[] = [];
      let anchor = from;
      for (let i = 0; i < path.length; ) {
        let j = path.length - 1;
        while (j > i && !clearSegment(region, anchor, path[j])) j--;
        simplified.push(path[j]);
        anchor = path[j];
        i = j + 1;
      }
      return simplified;
    }
    open.delete(current);
    const a = point(current);
    for (const dx of [-1, 0, 1])
      for (const dy of [-1, 0, 1]) {
        if (!dx && !dy) continue;
        const x = (current % cols) + dx,
          y = Math.floor(current / cols) + dy;
        if (x < 1 || x >= cols - 1 || y < 1 || y >= rows - 1) continue;
        const n = index(x, y),
          b = point(n);
        if (!clearSegment(region, a, b)) continue;
        const value = (cost.get(current) || 0) + Math.hypot(dx, dy);
        if (value < (cost.get(n) ?? Infinity)) {
          came.set(n, current);
          cost.set(n, value);
          score.set(
            n,
            value + Math.hypot(b.x - target.x, b.y - target.y) / step,
          );
          open.add(n);
        }
      }
  }
  return [];
}
export function regionRoute(from: number, to: number): number[] {
  const queue = [[from]],
    seen = new Set([from]);
  while (queue.length) {
    const path = queue.shift()!,
      last = path.at(-1)!;
    if (last === to) return path;
    for (const p of regionFor(last).landmarks.filter(
      (p) => p.kind === "portal",
    ))
      if (!seen.has(p.target!)) {
        seen.add(p.target!);
        queue.push([...path, p.target!]);
      }
  }
  return [];
}
