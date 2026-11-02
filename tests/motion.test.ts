import { test } from "node:test";
import assert from "node:assert/strict";
import { WorldMotion } from "../src/motion";
import { advanceMotion, validMotionInput } from "../shared/motion";
import { initialSoul } from "../shared/mischief";
import { regionFor, canStand } from "../shared/exploration";
import type { Player, Snapshot } from "../shared/world";
const player = (id = "local", x = 500): Player => ({
  id,
  name: id,
  x,
  y: 550,
  floor: 1,
  color: "#fff",
  maxFloor: 18,
  completed: [],
  soul: initialSoul(Date.now() - 10000),
});
const snapshot = (...players: Player[]): Snapshot => ({
  players,
  lanterns: [],
  chat: [],
});
test("local movement is immediate; acknowledgements replay only unacknowledged inputs and smooth small corrections", () => {
  const m = new WorldMotion(),
    p = player();
  m.receive(snapshot(p), "local", 0);
  m.step(1, 0, 40);
  m.step(1, 0, 40);
  assert.equal(m.player!.x, 520);
  const sent = m.flush();
  assert.deepEqual(
    sent.map((c) => c.seq),
    [1, 2],
  );
  m.receive(snapshot({ ...p, x: 510, inputSeq: 1 }), "local", 80);
  assert.equal(
    m.player!.x,
    520,
    "acknowledged movement is never applied twice",
  );
  m.receive(snapshot({ ...p, x: 505, inputSeq: 1 }), "local", 100);
  assert.equal(m.player!.x, 515);
  assert.ok(Math.abs(m.position(p, 100).x - 520) < 0.001);
  assert.ok(Math.abs(m.position(p, 1000).x - 515) < 0.01);
  m.receive(snapshot({ ...p, x: 515, inputSeq: 2 }), "local", 1200);
  assert.equal(m.player!.x, 515);
  assert.deepEqual(m.flush(), []);
});
test("authoritative control, region transitions and reconnect discard speculative movement", () => {
  const m = new WorldMotion(),
    p = player();
  m.receive(snapshot(p), "local", 0);
  m.step(1, 0, 40);
  const stunned = {
    ...p,
    soul: { ...p.soul!, state: "stunned" as const, until: Date.now() + 5000 },
  };
  m.receive(snapshot(stunned), "local", 20);
  m.step(1, 0, 40);
  assert.equal(m.player!.x, 500);
  assert.deepEqual(m.flush(), []);
  assert.equal(m.position(stunned, 20).x, 500);
  m.receive(snapshot({ ...p, floor: 2, x: 500 }), "local", 40);
  assert.equal(m.position({ ...p, floor: 2 }, 40).x, 500);
  m.reset();
  m.receive(snapshot(player("new")), "new", 60);
  m.step(1, 0, 40);
  assert.equal(m.flush()[0].seq, 1);
});
test("remote souls interpolate between snapshots, stop at newest sample and snap on state changes", () => {
  const m = new WorldMotion(),
    a = player(),
    b = player("remote");
  m.receive(snapshot(a, b), "local", 0);
  m.receive(snapshot(a, { ...b, x: 525 }), "local", 100);
  assert.equal(m.position(b, 130).x, 512.5);
  assert.equal(m.position(b, 400).x, 525);
  const fallen = {
    ...b,
    x: 560,
    soul: { ...b.soul!, state: "fallen" as const },
  };
  m.receive(snapshot(a, fallen), "local", 410);
  assert.equal(m.position(fallen, 410).x, 560);
});
test("shared prediction respects obstacles, bounds, diagonal speed and frame caps", () => {
  const p = { x: 500, y: 550 },
    diagonal = advanceMotion(1, p, { dx: 1, dy: 1, dt: 40 }, 250);
  assert.ok(
    Math.abs(Math.hypot(diagonal.x - p.x, diagonal.y - p.y) - 10) < 0.0001,
  );
  assert.equal(
    advanceMotion(1, { x: 55, y: 550 }, { dx: -1, dy: 0, dt: 40 }, 250).x,
    55,
  );
  const o = regionFor(1).obstacles[0],
    from = { x: o.x - o.r - 16, y: o.y },
    to = advanceMotion(1, from, { dx: 1, dy: 0, dt: 40 }, 250);
  assert.ok(canStand(1, to));
  const m = new WorldMotion();
  m.receive(snapshot(player()), "local", 0);
  m.step(1, 0, 5000);
  assert.equal(
    m.player!.x,
    510,
    "background tabs cannot accumulate a huge step",
  );
  assert.equal(
    validMotionInput({ seq: 1, floor: 1, dx: 1, dy: 0, dt: 40 }),
    true,
  );
  for (const bad of [
    { seq: 0 },
    { dx: NaN },
    { dx: 2 },
    { floor: 19 },
    { dt: 5000 },
  ])
    assert.equal(
      validMotionInput({ seq: 1, floor: 1, dx: 1, dy: 0, dt: 20, ...bad }),
      false,
    );
});
