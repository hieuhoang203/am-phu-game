import { test } from "node:test";
import assert from "node:assert/strict";
import { MischiefEngine } from "../server/mischief";
import { MISCHIEF, type Team } from "../shared/mischief";
import type { Player } from "../shared/world";
function fixture() {
  let now = 100000;
  const players = new Map<string, Player>(),
    log: string[] = [];
  const engine = new MischiefEngine(
    players,
    (m) => log.push(m),
    () => now,
  );
  const add = (id: string, team?: Team) => {
    const p: Player = {
      id,
      name: id,
      x: 400,
      y: 430,
      floor: 1,
      color: "#abc",
      maxFloor: 1,
      completed: [],
    };
    engine.join(p, team);
    players.set(id, p);
    return p;
  };
  const a = add("A", "A"),
    b = add("B", "B"),
    c = add("C", "B");
  b.x = 440;
  c.x = 450;
  c.y = 465;
  const advance = (ms: number) => {
    now += ms;
    engine.tick();
  };
  advance(3000);
  const stun = () => {
    assert.equal(
      engine.action(a, { action: "bonk", targetId: b.id }),
      undefined,
    );
    advance(1150);
    assert.equal(
      engine.action(a, { action: "bonk", targetId: b.id }),
      undefined,
    );
    assert.equal(b.soul!.state, "stunned");
  };
  return { engine, a, b, c, players, log, add, advance, stun };
}
test("players are always souls; automatic teams balance members", () => {
  const f = fixture();
  for (const p of f.players.values()) {
    assert.equal(p.form, "soul");
    assert.equal(p.soul!.state, "free");
  }
  const d = f.add("D");
  assert.equal(d.team, "C");
});
test("push is a fall, not stun; only a two-hit stun can lead to dragging and a near-stage throw", () => {
  const f = fixture(),
    { engine, a, b, advance } = f;
  assert.match(
    engine.action(a, { action: "drag", targetId: b.id })!,
    /choáng trước/,
  );
  assert.equal(engine.action(a, { action: "push", targetId: b.id }), undefined);
  assert.equal(b.soul!.state, "fallen");
  assert.equal(engine.canLeave(b), false);
  assert.equal(engine.speed(b), 0);
  a.x = 455;
  assert.match(
    engine.action(a, { action: "drag", targetId: b.id })!,
    /choáng trước/,
  );
  advance(1300);
  assert.equal(b.soul!.state, "free");
  assert.match(
    engine.action(a, { action: "bonk", targetId: b.id })!,
    /hào quang/,
  );
  advance(3100);
  a.x = 400;
  b.x = 440;
  b.y = 430;
  f.stun();
  assert.equal(engine.action(a, { action: "drag", targetId: b.id }), undefined);
  assert.equal(b.soul!.state, "dragged");
  assert.ok(engine.speed(a) < 190);
  assert.equal(engine.canLeave(a), false);
  assert.match(engine.action(a, { action: "throw" })!, /vòng ném/);
  const previous = { x: a.x, y: a.y };
  a.x = 470;
  a.y = 440;
  engine.moved(a, previous);
  assert.ok(Math.hypot(a.x - b.x, a.y - b.y) <= 30);
  assert.equal(engine.action(a, { action: "throw" }), undefined);
  assert.equal(b.soul!.state, "punished");
  assert.equal(a.soul!.dragging, undefined);
  assert.equal(b.soul!.draggedBy, undefined);
  assert.equal(engine.scores.A, 4);
  advance(3000);
  assert.equal(b.soul!.state, "free");
  assert.equal(b.y, 550);
  assert.equal(b.completed.length, 0);
});
test("one hit wears off; action cooldown, energy, safe zones and spawn grace are authoritative", () => {
  const { engine, a, b, advance } = fixture();
  assert.equal(engine.action(a, { action: "bonk", targetId: b.id }), undefined);
  const energy = a.soul!.energy;
  assert.match(
    engine.action(a, { action: "bonk", targetId: b.id })!,
    /đang hồi/,
  );
  assert.equal(a.soul!.energy, energy);
  advance(4100);
  assert.equal(b.soul!.combo, 0);
  assert.equal(engine.action(a, { action: "bonk", targetId: b.id }), undefined);
  assert.equal(b.soul!.state, "free");
  a.soul!.energy = 0;
  assert.match(engine.action(a, { action: "guard" })!, /Hết hơi/);
  a.soul!.energy = 100;
  a.x = 500;
  a.y = 550;
  b.x = 530;
  b.y = 530;
  advance(1200);
  assert.match(
    engine.action(a, { action: "bonk", targetId: b.id })!,
    /Vùng nghỉ/,
  );
  engine.join(b, "B");
  a.x = 400;
  a.y = 430;
  b.x = 440;
  b.y = 430;
  assert.match(
    engine.action(a, { action: "push", targetId: b.id })!,
    /hào quang/,
  );
});
test("guard consumes one incoming hit and knocks the attacker down", () => {
  const { engine, a, b } = fixture();
  assert.equal(engine.action(b, { action: "guard" }), undefined);
  assert.equal(engine.action(a, { action: "push", targetId: b.id }), undefined);
  assert.equal(a.soul!.state, "fallen");
  assert.equal(b.soul!.state, "free");
  assert.equal(b.soul!.guardUntil, 0);
});
test("an ally can break a drag; recovery immunity prevents chaining and scores only enemy-caused rescues", () => {
  const f = fixture();
  f.stun();
  f.engine.action(f.a, { action: "drag", targetId: f.b.id });
  assert.equal(
    f.engine.action(f.c, { action: "rescue", targetId: f.b.id }),
    undefined,
  );
  assert.equal(f.b.soul!.state, "free");
  assert.equal(f.a.soul!.dragging, undefined);
  assert.equal(f.engine.scores.B, 2);
  assert.match(
    f.engine.action(f.a, { action: "push", targetId: f.b.id })!,
    /hào quang/,
  );
  const friendly = fixture();
  friendly.a.team = "B";
  friendly.stun();
  friendly.engine.action(friendly.c, {
    action: "rescue",
    targetId: friendly.b.id,
  });
  assert.equal(
    friendly.engine.scores.B,
    0,
    "friendly grief cannot farm rescue points",
  );
});
test("three spaced struggles escape a drag without extending the original stun", () => {
  const f = fixture();
  f.stun();
  const deadline = f.b.soul!.until;
  f.engine.action(f.a, { action: "drag", targetId: f.b.id });
  assert.equal(f.b.soul!.until, deadline);
  for (let i = 0; i < 3; i++) {
    assert.equal(f.engine.action(f.b, { action: "struggle" }), undefined);
    if (i < 2) f.advance(700);
  }
  assert.equal(f.b.soul!.state, "free");
  assert.equal(f.a.soul!.dragging, undefined);
});
test("dragging into a sanctuary releases the victim; disconnects clean up both ends of a rope", () => {
  const f = fixture();
  f.stun();
  f.engine.action(f.a, { action: "drag", targetId: f.b.id });
  const previous = { x: f.a.x, y: f.a.y };
  f.a.x = 500;
  f.a.y = 550;
  f.engine.moved(f.a, previous);
  assert.equal(f.b.soul!.state, "free");
  assert.equal(f.a.soul!.dragging, undefined);
  const next = fixture();
  next.stun();
  next.engine.action(next.a, { action: "drag", targetId: next.b.id });
  next.engine.leave(next.a);
  assert.equal(next.b.soul!.state, "free");
  assert.equal(next.b.soul!.draggedBy, undefined);
  const third = fixture();
  third.stun();
  third.engine.action(third.a, { action: "drag", targetId: third.b.id });
  third.engine.leave(third.b);
  assert.equal(third.a.soul!.dragging, undefined);
});
test("all 18 stages accept a valid throw and restore the soul without taking seals", () => {
  for (let floor = 1; floor <= 18; floor++) {
    const f = fixture();
    f.a.floor = floor;
    f.b.floor = floor;
    f.b.completed = [1, 2];
    f.stun();
    f.engine.action(f.a, { action: "drag", targetId: f.b.id });
    f.a.x = 470;
    f.a.y = 450;
    f.engine.follow(f.a);
    assert.equal(f.engine.action(f.a, { action: "throw" }), undefined);
    assert.equal(f.b.soul!.state, "punished");
    assert.ok(f.b.soul!.lastEvent.length > 0);
    f.advance(3400);
    assert.equal(f.b.soul!.state, "free");
    assert.deepEqual(f.b.completed, [1, 2]);
  }
});
test("hitting a carrier drops their victim; an untouched drag still expires at the original deadline", () => {
  const f = fixture();
  f.stun();
  f.engine.action(f.a, { action: "drag", targetId: f.b.id });
  assert.equal(
    f.engine.action(f.c, { action: "push", targetId: f.a.id }),
    undefined,
  );
  assert.equal(f.a.soul!.state, "fallen");
  assert.equal(f.b.soul!.state, "free");
  assert.equal(f.a.soul!.dragging, undefined);
  const g = fixture();
  g.stun();
  g.engine.action(g.a, { action: "drag", targetId: g.b.id });
  g.advance(5100);
  assert.equal(g.b.soul!.state, "free");
  assert.equal(g.a.soul!.dragging, undefined);
  assert.ok(g.b.soul!.immuneUntil > 0);
});
test("banana traps check swept movement, can be disarmed, expire, and eventually trip their owner", () => {
  const f = fixture();
  assert.equal(f.engine.action(f.a, { action: "banana" }), undefined);
  const trap = f.engine.bananas[0];
  assert.equal(f.engine.bananas.length, 1);
  f.b.x = trap.x;
  f.b.y = trap.y + 35;
  f.engine.moved(f.b, { x: trap.x, y: trap.y - 35 });
  assert.equal(f.b.soul!.state, "fallen");
  assert.equal(f.engine.bananas.length, 0);
  const g = fixture();
  g.engine.action(g.a, { action: "banana" });
  g.b.x = g.engine.bananas[0].x;
  g.b.y = g.engine.bananas[0].y + 30;
  assert.equal(g.engine.action(g.b, { action: "disarm" }), undefined);
  assert.equal(g.engine.bananas.length, 0);
  const h = fixture();
  h.engine.action(h.a, { action: "banana" });
  h.advance(1100);
  const t = h.engine.bananas[0];
  h.a.x = t.x;
  h.a.y = t.y;
  h.engine.moved(h.a, { x: t.x, y: t.y + 30 });
  assert.equal(h.a.soul!.state, "fallen");
  const e = fixture();
  e.engine.action(e.a, { action: "banana" });
  e.advance(16000);
  assert.equal(e.engine.bananas.length, 0);
  const safe = fixture();
  safe.a.x = 500;
  safe.a.y = 550;
  assert.match(safe.engine.action(safe.a, { action: "banana" })!, /vùng nghỉ/);
});
test("reject self, cross-floor, missing targets, unknown actions, stacking hits and distant rescues", () => {
  const f = fixture();
  assert.match(
    f.engine.action(f.a, { action: "bonk", targetId: f.a.id })!,
    /vong hồn khác/,
  );
  f.b.floor = 2;
  assert.match(
    f.engine.action(f.a, { action: "bonk", targetId: f.b.id })!,
    /cùng tầng/,
  );
  f.b.floor = 1;
  assert.match(f.engine.action(f.a, { action: "toString" })!, /không hợp lệ/);
  assert.match(f.engine.action(f.a, { action: "throw" })!, /Phải kéo/);
  f.stun();
  assert.match(
    f.engine.action(f.c, { action: "push", targetId: f.b.id })!,
    /không chồng/,
  );
  f.c.x = 800;
  assert.match(
    f.engine.action(f.c, { action: "rescue", targetId: f.b.id })!,
    /Xa quá/,
  );
});
