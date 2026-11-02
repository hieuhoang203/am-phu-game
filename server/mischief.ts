import { MAP, clearSegment, canStand } from "../shared/exploration";
import { randomUUID } from "node:crypto";
import type { Player } from "../shared/world";
import { WORLD } from "../shared/world";
import {
  MISCHIEF,
  prankRules,
  initialSoul,
  movementFactor,
  inSanctuary,
  punishmentEffects,
  type PrankAction,
  type Team,
  type BananaTrap,
  type SocialSnapshot,
} from "../shared/mischief";

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
export class MischiefEngine {
  scores: Record<Team, number> = { A: 0, B: 0, C: 0 };
  bananas: BananaTrap[] = [];
  private lastTick: number;
  constructor(
    readonly players: Map<string, Player>,
    private announce: (message: string) => void,
    private now: () => number = Date.now,
  ) {
    this.lastTick = now();
  }
  soul(p: Player) {
    return p.soul || (p.soul = initialSoul(this.now()));
  }
  join(p: Player, team?: Team) {
    p.form = "soul";
    p.team =
      team ||
      (["A", "B", "C"] as Team[]).sort(
        (a, b) =>
          [...this.players.values()].filter((q) => q.team === a).length -
          [...this.players.values()].filter((q) => q.team === b).length,
      )[0];
    p.soul = initialSoul(this.now());
  }
  speed(p: Player) {
    return WORLD.speed * movementFactor(this.soul(p), this.now());
  }
  private unlink(p: Player) {
    const s = this.soul(p);
    if (s.draggedBy) {
      const holder = this.players.get(s.draggedBy);
      if (holder) this.soul(holder).dragging = undefined;
      s.draggedBy = undefined;
    }
    if (s.dragging) {
      const carried = this.players.get(s.dragging);
      s.dragging = undefined;
      if (carried) this.recover(carried, "Đã được thả xuống.");
    }
  }
  private recover(p: Player, reason: string, respawn = false) {
    this.unlink(p);
    const s = this.soul(p);
    s.state = "free";
    s.until = 0;
    s.combo = 0;
    s.comboUntil = 0;
    s.guardUntil = 0;
    s.struggles = 0;
    s.immuneUntil = this.now() + MISCHIEF.recoveryProtection;
    s.lastEvent = reason;
    if (respawn) {
      p.x = WORLD.spawn.x;
      p.y = WORLD.spawn.y;
      s.energy = Math.max(55, s.energy);
      if (p.floor === 8 || p.floor === 13) s.slowUntil = this.now() + 3500;
    }
  }
  private control(
    p: Player,
    state: "fallen" | "stunned" | "punished",
    duration: number,
    reason: string,
    causeTeam?: Team,
  ) {
    this.unlink(p);
    const s = this.soul(p);
    s.state = state;
    s.until = this.now() + duration;
    s.guardUntil = 0;
    s.struggles = 0;
    s.lastEvent = reason;
    s.sourceTeam = causeTeam;
  }
  private protected(p: Player) {
    return this.soul(p).immuneUntil > this.now() || inSanctuary(p);
  }
  private score(p: Player, target: Player, amount: number, rescue = false) {
    if (
      p.team &&
      target.team &&
      (rescue ? p.team === target.team : p.team !== target.team)
    )
      this.scores[p.team] += amount;
  }
  action(actor: Player, input: unknown): string | undefined {
    this.tick();
    if (!input || typeof input !== "object") return "Thao tác không hợp lệ.";
    const { action, targetId } = input as {
      action: PrankAction;
      targetId?: string;
    };
    if (typeof action !== "string" || !Object.hasOwn(prankRules, action))
      return "Thao tác không hợp lệ.";
    const now = this.now(),
      s = this.soul(actor),
      rule = prankRules[action];
    if ((s.cooldowns[action] || 0) > now)
      return "Chiêu đang hồi. Chờ một nhịp nhé!";
    if (s.energy < rule.cost)
      return "Hết hơi rồi! Nghỉ một chút để hồi thể lực.";
    if (action === "struggle") {
      if (s.state === "free") return "Bạn đang tự do, không cần vùng vẫy.";
      s.energy -= rule.cost;
      s.cooldowns.struggle = now + rule.cooldown;
      s.struggles++;
      s.until -= 850;
      s.lastEvent = "Đang vùng vẫy thoát thân!";
      if (s.until <= now || (s.state === "dragged" && s.struggles >= 3))
        this.recover(actor, "Vùng vẫy thành công!", s.state === "punished");
      return;
    }
    if (s.state !== "free")
      return "Bạn đang bị khống chế. Hãy vùng vẫy hoặc nhờ người cứu.";
    const target =
      typeof targetId === "string" ? this.players.get(targetId) : undefined;
    const needsTarget = ["push", "bonk", "drag", "rescue"].includes(action);
    if (
      needsTarget &&
      (!target || target.id === actor.id || target.floor !== actor.floor)
    )
      return "Chọn một vong hồn khác ở cùng tầng.";
    if (needsTarget && distance(actor, target!) > rule.range)
      return "Xa quá! Hãy đến gần mục tiêu.";
    if (s.dragging && !["release", "throw"].includes(action))
      return "Đang kéo người: hãy thả hoặc ném trước khi dùng chiêu khác.";
    const spend = () => {
      s.energy -= rule.cost;
      s.cooldowns[action] = now + rule.cooldown;
      s.action = action;
      s.actionUntil = now + 500;
      s.lastEvent = `${rule.label}!`;
    };
    if (action === "release") {
      if (!s.dragging) return "Bạn chưa kéo ai.";
      const victim = this.players.get(s.dragging);
      spend();
      this.unlink(actor);
      if (victim) this.announce(`${actor.name} thả ${victim.name} xuống.`);
      return;
    }
    if (action === "guard") {
      spend();
      s.guardUntil = now + 1800;
      s.lastEvent = "Đang thủ thế đỡ đòn!";
      return;
    }
    if (action === "banana") {
      const point = {
        x: clamp(actor.x + s.facing.x * 45, MAP.minX, MAP.maxX),
        y: clamp(actor.y + s.facing.y * 45, MAP.minY, MAP.maxY),
      };
      if (inSanctuary(actor) || inSanctuary(point))
        return "Không đặt bẫy trong vùng nghỉ.";
      if (this.bananas.filter((b) => b.floor === actor.floor).length >= 6)
        return "Tầng này đã có 6 vỏ chuối. Dọn bớt trước nhé!";
      spend();
      this.bananas.push({
        id: randomUUID(),
        owner: actor.id,
        floor: actor.floor,
        ...point,
        createdAt: now,
        expiresAt: now + 15000,
      });
      s.lastEvent = "Vỏ chuối đã lên sàn!";
      return;
    }
    if (action === "disarm") {
      const banana = this.bananas
        .filter(
          (b) => b.floor === actor.floor && distance(actor, b) <= rule.range,
        )
        .sort((a, b) => distance(actor, a) - distance(actor, b))[0];
      if (!banana) return "Không có bẫy nào đủ gần để dọn.";
      spend();
      this.bananas = this.bananas.filter((b) => b.id !== banana.id);
      s.lastEvent = "Đã dọn một vỏ chuối.";
      return;
    }
    if (action === "throw") {
      const victim = s.dragging ? this.players.get(s.dragging) : undefined;
      if (
        !victim ||
        this.soul(victim).state !== "dragged" ||
        this.soul(victim).draggedBy !== actor.id
      )
        return "Phải kéo một vong đang choáng trước khi ném.";
      if (
        victim.floor !== actor.floor ||
        distance(actor, MISCHIEF.trap) > MISCHIEF.trap.radius
      )
        return "Đưa vong đang kéo vào vòng ném ở sân hình phạt.";
      if (inSanctuary(actor)) return "Không ném từ vùng nghỉ.";
      spend();
      const effect = punishmentEffects[actor.floor - 1];
      this.control(
        victim,
        "punished",
        effect.duration,
        effect.label,
        actor.team,
      );
      victim.x = MISCHIEF.trap.x;
      victim.y = MISCHIEF.trap.y;
      this.score(actor, victim, 3);
      this.announce(`${actor.name} ném ${victim.name}: ${effect.label}!`);
      return;
    }
    const t = this.soul(target!);
    if (action === "rescue") {
      if (t.state === "free") return "Vong này chưa cần cứu.";
      spend();
      const enemyCaused = t.sourceTeam && t.sourceTeam !== target!.team;
      this.recover(target!, `${actor.name} vừa giải cứu!`);
      if (enemyCaused) this.score(actor, target!, 2, true);
      this.announce(`${actor.name} giải cứu ${target!.name}.`);
      return;
    }
    if (this.protected(actor) || this.protected(target!))
      return "Vùng nghỉ hoặc hào quang hồi hồn đang bảo vệ. Chờ hết hào quang để quậy.";
    if (action === "drag") {
      if (t.state !== "stunned")
        return "Phải đánh choáng trước mới được kéo; đẩy ngã chưa đủ.";
      if (t.draggedBy) return "Vong này đã có người kéo.";
      spend();
      s.dragging = target!.id;
      t.draggedBy = actor.id;
      t.state = "dragged";
      t.struggles = 0;
      t.lastEvent = `Đang bị ${actor.name} kéo!`;
      this.follow(actor);
      this.announce(`${actor.name} đang kéo ${target!.name}.`);
      return;
    }
    if (t.state !== "free")
      return "Mục tiêu đang ngã, choáng hoặc bị giữ; không chồng thêm đòn.";
    spend();
    s.guardUntil = 0;
    if (t.guardUntil > now) {
      t.guardUntil = 0;
      this.control(
        actor,
        "fallen",
        850,
        `${target!.name} đỡ đòn, bạn tự ngã!`,
        target!.team,
      );
      this.announce(`${target!.name} đỡ đòn khiến ${actor.name} ngã chổng vó!`);
      return;
    }
    if (action === "push") {
      const d = distance(actor, target!) || 1,
        dx =
          distance(actor, target!) < 1 ? s.facing.x : (target!.x - actor.x) / d,
        dy =
          distance(actor, target!) < 1 ? s.facing.y : (target!.y - actor.y) / d;
      this.control(
        target!,
        "fallen",
        MISCHIEF.fallenDuration,
        `${actor.name} đẩy ngã!`,
        actor.team,
      );
      const landing = {
        x: clamp(target!.x + dx * 55, MAP.minX, MAP.maxX),
        y: clamp(target!.y + dy * 55, MAP.minY, MAP.maxY),
      };
      if (clearSegment(actor.floor, target!, landing))
        Object.assign(target!, landing);
      this.announce(`${actor.name} đẩy ${target!.name} ngã lăn!`);
      return;
    }
    if (action === "bonk") {
      t.combo = (t.comboUntil > now ? t.combo : 0) + 1;
      t.comboUntil = now + MISCHIEF.comboWindow;
      t.lastEvent = `Bị ${actor.name} gõ đầu (${t.combo}/2)!`;
      if (t.combo >= 2) {
        this.control(
          target!,
          "stunned",
          MISCHIEF.stunDuration,
          "Choáng! Có thể bị kéo.",
          actor.team,
        );
        t.combo = 0;
        this.score(actor, target!, 1);
        this.announce(`${actor.name} gõ ${target!.name} choáng váng!`);
      }
      return;
    }
  }
  follow(actor: Player) {
    const s = this.soul(actor);
    if (!s.dragging) return;
    const t = this.players.get(s.dragging);
    if (!t || t.floor !== actor.floor) {
      s.dragging = undefined;
      return;
    }
    if (inSanctuary(actor)) {
      this.recover(t, "Được đưa về vùng nghỉ.");
      return;
    }
    const trailing = {
      x: clamp(actor.x - s.facing.x * 29, MAP.minX, MAP.maxX),
      y: clamp(actor.y - s.facing.y * 29, MAP.minY, MAP.maxY),
    };
    if (canStand(actor.floor, trailing)) Object.assign(t, trailing);
    else Object.assign(t, { x: actor.x, y: actor.y });
  }
  moved(actor: Player, previous: { x: number; y: number }) {
    const s = this.soul(actor),
      dx = actor.x - previous.x,
      dy = actor.y - previous.y,
      d = Math.hypot(dx, dy);
    if (d > 0) s.facing = { x: dx / d, y: dy / d };
    this.follow(actor);
    if (s.state !== "free" || this.protected(actor)) return;
    const hit = this.bananas.find((b) => {
      if (
        b.floor !== actor.floor ||
        (b.owner === actor.id && this.now() - b.createdAt < 1000)
      )
        return false;
      const v = { x: actor.x - previous.x, y: actor.y - previous.y },
        t = clamp(
          ((b.x - previous.x) * v.x + (b.y - previous.y) * v.y) /
            (v.x * v.x + v.y * v.y || 1),
          0,
          1,
        );
      return (
        distance(b, { x: previous.x + t * v.x, y: previous.y + t * v.y }) < 23
      );
    });
    if (hit) {
      this.bananas = this.bananas.filter((b) => b.id !== hit.id);
      this.control(
        actor,
        "fallen",
        1600,
        "Trượt vỏ chuối!",
        this.players.get(hit.owner)?.team,
      );
      this.announce(`${actor.name} trượt vỏ chuối, ngã xoay vòng!`);
    }
  }
  canLeave(p: Player) {
    const s = this.soul(p);
    return s.state === "free" && !s.dragging && !s.draggedBy;
  }
  leave(p: Player) {
    this.unlink(p);
    this.bananas = this.bananas.filter((b) => b.owner !== p.id);
  }
  tick() {
    const now = this.now(),
      dt = clamp((now - this.lastTick) / 1000, 0, 0.5);
    this.lastTick = now;
    this.bananas = this.bananas.filter((b) => b.expiresAt > now);
    for (const p of this.players.values()) {
      const s = this.soul(p);
      s.energy = Math.min(100, s.energy + MISCHIEF.regeneration * dt);
      if (s.combo && s.comboUntil <= now) s.combo = 0;
      if (s.state !== "free" && s.until <= now)
        this.recover(
          p,
          s.state === "punished"
            ? "Hồi hồn! Ấn khám phá vẫn nguyên vẹn."
            : "Đã tỉnh lại. Có hào quang bảo vệ.",
          s.state === "punished",
        );
    }
  }
  snapshot(floor: number): SocialSnapshot {
    return {
      serverTime: this.now(),
      scores: { ...this.scores },
      bananas: this.bananas.filter((b) => b.floor === floor),
      roster: [...this.players.values()].map((p) => ({
        id: p.id,
        name: p.name,
        team: p.team || "A",
        floor: p.floor,
      })),
    };
  }
}
