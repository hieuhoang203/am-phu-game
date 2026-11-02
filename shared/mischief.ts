export type Team = "A" | "B" | "C";
export type SoulState = "free" | "fallen" | "stunned" | "dragged" | "punished";
export type PrankAction =
  | "push"
  | "bonk"
  | "drag"
  | "release"
  | "throw"
  | "guard"
  | "rescue"
  | "struggle"
  | "banana"
  | "disarm";
export const teams: Record<Team, { name: string; color: string }> = {
  A: { name: "Hội Đèn Lồng", color: "#e4b56e" },
  B: { name: "Hội Sương Khói", color: "#88c6db" },
  C: { name: "Hội Lá Bùa", color: "#b5a1db" },
};
export const stateNames: Record<SoulState, string> = {
  free: "Tự do",
  fallen: "Ngã lăn",
  stunned: "Choáng",
  dragged: "Bị kéo",
  punished: "Dính hình phạt",
};
export const prankRules: Record<
  PrankAction,
  {
    label: string;
    key: string;
    cost: number;
    cooldown: number;
    range: number;
    hint: string;
  }
> = {
  push: {
    label: "Đẩy ngã",
    key: "F",
    cost: 18,
    cooldown: 2800,
    range: 70,
    hint: "Áp sát, đẩy văng và ngã 1,2 giây. Ngã chưa đủ điều kiện để kéo.",
  },
  bonk: {
    label: "Gõ đầu",
    key: "G",
    cost: 24,
    cooldown: 1100,
    range: 65,
    hint: "Hai cú trong 4 giây gây choáng 5 giây. Mỗi người giữ thể lực riêng.",
  },
  drag: {
    label: "Kéo vong",
    key: "R",
    cost: 10,
    cooldown: 800,
    range: 70,
    hint: "Chỉ kéo được vong đang choáng. Đi chậm, phải đưa tới gần sân hình phạt.",
  },
  release: {
    label: "Thả xuống",
    key: "R",
    cost: 0,
    cooldown: 350,
    range: 0,
    hint: "Buông người đang kéo. Không kéo qua cổng tầng.",
  },
  throw: {
    label: "Ném vào hình phạt",
    key: "T",
    cost: 20,
    cooldown: 5000,
    range: 100,
    hint: "Phải đang kéo một vong và đứng trong vùng ném. Hình phạt chỉ giữ vài giây.",
  },
  guard: {
    label: "Đỡ đòn",
    key: "Q",
    cost: 15,
    cooldown: 4500,
    range: 0,
    hint: "Đỡ cú đẩy/gõ trong 1,8 giây, khiến người ra đòn bị ngã. Khi đỡ di chuyển chậm.",
  },
  rescue: {
    label: "Cứu vong",
    key: "C",
    cost: 15,
    cooldown: 3500,
    range: 85,
    hint: "Giải cứu người ngã, choáng, bị kéo hoặc dính hình phạt. Có thể cứu cả đối thủ.",
  },
  struggle: {
    label: "Vùng vẫy",
    key: "Space",
    cost: 10,
    cooldown: 650,
    range: 0,
    hint: "Rút ngắn khống chế. Ba lần vùng vẫy thoát kéo; có thể tự thoát hình phạt.",
  },
  banana: {
    label: "Đặt vỏ chuối",
    key: "B",
    cost: 22,
    cooldown: 9000,
    range: 0,
    hint: "Đặt trước mặt, tồn tại 15 giây. Chủ bẫy cũng trượt sau 1 giây.",
  },
  disarm: {
    label: "Dọn bẫy",
    key: "V",
    cost: 4,
    cooldown: 700,
    range: 55,
    hint: "Dọn vỏ chuối gần nhất, kể cả bẫy của mình.",
  },
};
export const MISCHIEF = {
  safeZones: [
    { x: 240, y: 1550, radius: 65, name: "Bến Vong Xuyên" },
    { x: 2450, y: 1450, radius: 65, name: "Khe nứt âm giới" },
    { x: 500, y: 550, radius: 58, name: "Điểm hồi hồn" },
    { x: 500, y: 295, radius: 65, name: "Trạm nghỉ" },
    { x: 500, y: 155, radius: 65, name: "Cổng tầng" },
  ],
  trap: { x: 500, y: 450, radius: 100 },
  spawnProtection: 2500,
  recoveryProtection: 3000,
  stunDuration: 5000,
  fallenDuration: 1200,
  comboWindow: 4000,
  dragSpeed: 0.56,
  guardSpeed: 0.65,
  regeneration: 10,
};
export interface MischiefState {
  state: SoulState;
  until: number;
  energy: number;
  combo: number;
  comboUntil: number;
  immuneUntil: number;
  guardUntil: number;
  dragging?: string;
  draggedBy?: string;
  struggles: number;
  cooldowns: Partial<Record<PrankAction, number>>;
  facing: { x: number; y: number };
  slowUntil: number;
  lastEvent: string;
  sourceTeam?: Team;
  action?: PrankAction;
  actionUntil?: number;
}
export interface BananaTrap {
  id: string;
  owner: string;
  floor: number;
  x: number;
  y: number;
  createdAt: number;
  expiresAt: number;
}
export interface SocialSnapshot {
  serverTime: number;
  scores: Record<Team, number>;
  bananas: BananaTrap[];
  roster: { id: string; name: string; team: Team; floor: number }[];
}
export const inSanctuary = (p: { x: number; y: number }) =>
  MISCHIEF.safeZones.some((z) => Math.hypot(p.x - z.x, p.y - z.y) < z.radius);
export const initialSoul = (now: number): MischiefState => ({
  state: "free",
  until: 0,
  energy: 100,
  combo: 0,
  comboUntil: 0,
  immuneUntil: now + MISCHIEF.spawnProtection,
  guardUntil: 0,
  struggles: 0,
  cooldowns: {},
  facing: { x: 0, y: -1 },
  slowUntil: 0,
  lastEvent: "Vong hồn vừa tới âm giới.",
});
export const movementFactor = (s: MischiefState | undefined, now: number) =>
  !s
    ? 1
    : s.state !== "free"
      ? 0
      : (s.dragging ? MISCHIEF.dragSpeed : 1) *
        (s.guardUntil > now ? MISCHIEF.guardSpeed : 1) *
        (s.slowUntil > now ? 0.6 : 1);
export const punishmentEffects = [
  { label: "Lưỡi xoắn như dây thun", duration: 2800 },
  { label: "Kéo sắt tỉa bóng hồn", duration: 2600 },
  { label: "Mắc áo trên cây sắt", duration: 3000 },
  { label: "Gương chiếu lại màn troll", duration: 2400 },
  { label: "Xông hơi chưng lung", duration: 3000 },
  { label: "Cột đồng nóng quá!", duration: 2800 },
  { label: "Tập leo núi đao", duration: 3000 },
  { label: "Đông thành kem vong", duration: 3000 },
  { label: "Vạc dầu tắm bong bóng", duration: 3200 },
  { label: "Trâu xoay như chong chóng", duration: 2800 },
  { label: "Ép phẳng rồi phồng lại", duration: 2600 },
  { label: "Giã như bắp rang", duration: 2800 },
  { label: "Bơi huyết trì", duration: 3000 },
  { label: "Tạm giữ ở Uổng Tử", duration: 2200 },
  { label: "Bóng hồn tách rồi tụ", duration: 3000 },
  { label: "Hơ tóc trên hỏa sơn", duration: 3000 },
  { label: "Xay thành đốm hồn", duration: 2800 },
  { label: "Cưa bóng hồn thành đôi", duration: 3000 },
];
