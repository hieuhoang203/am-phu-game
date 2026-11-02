import { clearSegment, type Point } from "./exploration";
export interface MotionInput {
  seq: number;
  floor: number;
  dx: number;
  dy: number;
  dt: number;
}
/** Identical collision and analogue movement on client and server. dt is milliseconds. */
export function advanceMotion(
  region: number,
  from: Point,
  input: Pick<MotionInput, "dx" | "dy" | "dt">,
  speed: number,
): Point {
  const magnitude = Math.hypot(input.dx, input.dy),
    scale = Math.max(1, magnitude);
  const to = {
    x: from.x + ((input.dx / scale) * speed * input.dt) / 1000,
    y: from.y + ((input.dy / scale) * speed * input.dt) / 1000,
  };
  if (clearSegment(region, from, to)) return to;
  const x = { x: to.x, y: from.y },
    y = { x: from.x, y: to.y };
  return clearSegment(region, from, x)
    ? x
    : clearSegment(region, from, y)
      ? y
      : { x: from.x, y: from.y };
}
export function validMotionInput(value: unknown): value is MotionInput {
  if (!value || typeof value !== "object") return false;
  const p = value as MotionInput;
  return (
    Number.isSafeInteger(p.seq) &&
    p.seq > 0 &&
    Number.isInteger(p.floor) &&
    p.floor >= 1 &&
    p.floor <= 18 &&
    Number.isFinite(p.dx) &&
    Number.isFinite(p.dy) &&
    Math.abs(p.dx) <= 1 &&
    Math.abs(p.dy) <= 1 &&
    Number.isFinite(p.dt) &&
    p.dt > 0 &&
    p.dt <= 40
  );
}
