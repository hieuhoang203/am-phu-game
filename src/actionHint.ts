import {
  MISCHIEF,
  inSanctuary,
  prankRules,
  type PrankAction,
} from "../shared/mischief";
import type { Player, Snapshot } from "../shared/world";
/** Client guidance only: the server independently verifies every action. */
export function actionHint(
  action: PrankAction,
  me: Player,
  target: Player | undefined,
  world: Snapshot,
): string {
  const s = me.soul;
  if (!s) return "Đang hồi hồn";
  const now = world.social?.serverTime || Date.now(),
    r = prankRules[action];
  if ((s.cooldowns[action] || 0) > now) return "Đang hồi chiêu";
  if (s.energy < r.cost) return "Thiếu thể lực";
  if (action === "struggle") return s.state === "free" ? "Bạn đang tự do" : "";
  if (s.state !== "free") return "Đang bị khống chế";
  if (action === "release") return s.dragging ? "" : "Bạn chưa kéo ai";
  if (s.dragging && !["release", "throw"].includes(action))
    return "Thả người trước";
  if (action === "throw") {
    if (!s.dragging) return "Cần kéo vong đang choáng trước";
    if (
      Math.hypot(me.x - MISCHIEF.trap.x, me.y - MISCHIEF.trap.y) >
      MISCHIEF.trap.radius
    )
      return "Đưa người đang kéo tới sân hình phạt";
  }
  if (["push", "bonk", "drag", "rescue"].includes(action)) {
    if (!target || target.id === me.id) return "Chọn một vong khác";
    if (Math.hypot(me.x - target.x, me.y - target.y) > r.range)
      return "Đến gần mục tiêu hơn";
    if (action === "rescue")
      return target.soul?.state === "free" ? "Vong này chưa cần cứu" : "";
    if (
      inSanctuary(me) ||
      inSanctuary(target) ||
      s.immuneUntil > now ||
      (target.soul?.immuneUntil || 0) > now
    )
      return "Đang ở vùng bảo hộ hoặc miễn khống chế";
    if (action === "drag" && target.soul?.state !== "stunned")
      return "Gõ choáng trước khi kéo";
    if (["push", "bonk"].includes(action) && target.soul?.state !== "free")
      return "Mục tiêu đã bị khống chế";
  }
  if (action === "banana" && inSanctuary(me))
    return "Ra khỏi vùng bảo hộ để đặt bẫy";
  if (
    action === "disarm" &&
    !world.social?.bananas.some(
      (b) => Math.hypot(b.x - me.x, b.y - me.y) <= r.range,
    )
  )
    return "Chưa có bẫy ở gần";
  return "";
}
