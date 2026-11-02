import { advanceMotion, type MotionInput } from "../shared/motion";
import { WORLD, type Player, type Snapshot } from "../shared/world";
import { movementFactor } from "../shared/mischief";
import type { Point } from "../shared/exploration";
type Sample = Point & { time: number; floor: number; state: string };
/** Prediction for the local soul, acknowledgement/replay, and buffered remote interpolation. */
export class WorldMotion {
  private local?: Player;
  private pending: MotionInput[] = [];
  private outgoing: MotionInput[] = [];
  private sequence = 0;
  private history = new Map<string, Sample[]>();
  private offset: Point = { x: 0, y: 0 };
  private offsetTime = 0;
  private serverOffset = 0;
  reset() {
    this.local = undefined;
    this.pending = [];
    this.outgoing = [];
    this.sequence = 0;
    this.history.clear();
    this.offset = { x: 0, y: 0 };
  }
  get player() {
    return this.local;
  }
  serverNow() {
    return Date.now() + this.serverOffset;
  }
  receive(world: Snapshot, id: string, time: number) {
    this.serverOffset = (world.social?.serverTime || Date.now()) - Date.now();
    const current = world.players.find((p) => p.id === id),
      old = this.local;
    if (current) {
      const discontinuity =
        !old ||
        old.id !== current.id ||
        old.floor !== current.floor ||
        old.soul?.state !== current.soul?.state ||
        Math.hypot(old.x - current.x, old.y - current.y) > 300;
      const shown = old ? this.position(old, time) : current;
      this.pending = this.pending.filter(
        (c) => c.seq > (current.inputSeq || 0) && c.floor === current.floor,
      );
      this.outgoing = this.outgoing.filter(
        (c) => c.floor === current.floor && c.seq > (current.inputSeq || 0),
      );
      this.local = { ...current };
      if (current.soul?.state === "free")
        for (const c of this.pending)
          Object.assign(
            this.local,
            advanceMotion(
              c.floor,
              this.local,
              c,
              WORLD.speed * movementFactor(current.soul, this.serverNow()),
            ),
          );
      else {
        this.pending = [];
        this.outgoing = [];
      }
      this.offset = discontinuity
        ? { x: 0, y: 0 }
        : { x: shown.x - this.local.x, y: shown.y - this.local.y };
      this.offsetTime = time;
    }
    const alive = new Set(world.players.map((p) => p.id));
    for (const key of this.history.keys())
      if (!alive.has(key)) this.history.delete(key);
    for (const p of world.players) {
      if (p.id === id) continue;
      let samples = this.history.get(p.id) || [];
      const last = samples.at(-1),
        state = p.soul?.state || "free";
      if (
        last &&
        (last.floor !== p.floor ||
          last.state !== state ||
          Math.hypot(last.x - p.x, last.y - p.y) > 250)
      )
        samples = [];
      samples.push({ x: p.x, y: p.y, time, floor: p.floor, state });
      this.history.set(p.id, samples.slice(-12));
    }
  }
  step(dx: number, dy: number, dt: number) {
    const p = this.local;
    if (
      !p ||
      dt <= 0 ||
      !Number.isFinite(dt) ||
      !Math.hypot(dx, dy) ||
      p.soul?.state !== "free"
    )
      return;
    // A hidden tab or stalled frame never creates a catch-up movement burst.
    const command: MotionInput = {
      seq: ++this.sequence,
      floor: p.floor,
      dx,
      dy,
      dt: Math.min(40, dt),
    };
    Object.assign(
      p,
      advanceMotion(
        p.floor,
        p,
        command,
        WORLD.speed * movementFactor(p.soul, this.serverNow()),
      ),
    );
    this.pending.push(command);
    this.outgoing.push(command);
    // A disconnected transport cannot retain unlimited unacknowledged movement.
    if (this.pending.length > 180) {
      this.pending = [];
      this.outgoing = [];
    }
  }
  flush() {
    const commands = this.outgoing.splice(0, 8);
    return commands;
  }
  position(player: Player, time: number): Point {
    if (player.id === this.local?.id) {
      const decay = Math.exp(-Math.max(0, time - this.offsetTime) / 65);
      return {
        x: this.local.x + this.offset.x * decay,
        y: this.local.y + this.offset.y * decay,
      };
    }
    const samples = this.history.get(player.id);
    if (!samples?.length) return player;
    const at = time - 80;
    for (let i = 1; i < samples.length; i++) {
      const a = samples[i - 1],
        b = samples[i];
      if (at <= b.time) {
        const t = Math.max(
          0,
          Math.min(1, (at - a.time) / Math.max(1, b.time - a.time)),
        );
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      }
    }
    return samples.at(-1)!;
  }
}
