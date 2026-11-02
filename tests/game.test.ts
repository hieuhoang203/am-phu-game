import {
  MAP,
  regionFor,
  regionRoute,
  routeTo,
  clearSegment,
  canStand,
  type Point,
} from "../shared/exploration";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Server } from "socket.io";
import { io as client, type Socket } from "socket.io-client";
import { attachGame } from "../server/game.js";
import { floors, WORLD, type Snapshot, type Player } from "../shared/world.js";
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
function once<T>(socket: Socket, event: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, handler);
      reject(new Error(`Timed out: ${event}`));
    }, 4000);
    const handler = (data: T) => {
      clearTimeout(timer);
      resolve(data);
    };
    socket.once(event, handler);
  });
}

test("18 regions are open, linked and all landmarks have a valid walking route", () => {
  assert.equal(floors.length, 18);
  for (const floor of floors) {
    const r = regionFor(floor.id);
    assert.equal("question" in floor, false);
    assert.equal(r.landmarks.filter((l) => l.kind === "portal").length, 3);
    for (const l of r.landmarks) {
      const route = routeTo(r, MAP.spawn, l);
      assert.ok(route.length, "route " + floor.id + ":" + l.id);
      let p: Point = MAP.spawn;
      for (const next of route) {
        assert.ok(clearSegment(r, p, next));
        p = next;
      }
    }
    for (const other of floors)
      assert.equal(regionRoute(floor.id, other.id).at(-1), other.id);
    assert.equal(canStand(r, { x: 0, y: 0 }), false);
    for (const o of r.obstacles) assert.equal(canStand(r, o), false);
  }
});
test("multiplayer exploration: nearby portals only, no quiz, private discoveries, chat isolation and persistence", async () => {
  const dir = mkdtempSync(join(tmpdir(), "ow-game-")),
    file = join(dir, "save.json"),
    http = createServer(),
    io = new Server(http);
  const { rooms } = attachGame(io, file);
  await new Promise<void>((r) => http.listen(0, "127.0.0.1", r));
  const sockets: Socket[] = [];
  const connect = async (room: string, name: string, token?: string) => {
    const s = client(
      "http://127.0.0.1:" + (http.address() as { port: number }).port,
      { transports: ["websocket"] },
    );
    sockets.push(s);
    await once(s, "connect");
    const joined = once<{ player: Player; token: string }>(s, "joined");
    s.emit("join", { room, name, token });
    return { s, ...(await joined) };
  };
  try {
    const a = await connect("OPEN", "Vong A"),
      b = await connect("OPEN", "Vong B"),
      c = await connect("OTHER", "Vong C");
    const live = rooms.get("OPEN")!,
      p = live.players.get(a.s.id!)!;
    assert.equal(p.maxFloor, 18);
    assert.deepEqual(p.visited, [1]);
    let denied = once<string>(a.s, "notice");
    a.s.emit("travel", 18);
    assert.match(await denied, /cổng/);
    assert.equal(p.floor, 1);
    a.s.emit("move", { x: 2000, y: 1500 });
    await pause(70);
    assert.equal(p.x, 500);
    // Server state positioning isolates interaction rules from transport walk timing.
    const cache = regionFor(1).landmarks.find((l) => l.kind === "cache")!;
    denied = once(a.s, "notice");
    a.s.emit("interact", cache.id);
    assert.match(await denied, /gần/);
    p.x = cache.x;
    p.y = cache.y;
    a.s.emit("interact", cache.id);
    await pause(70);
    assert.equal(p.sparks, 25);
    assert.ok(p.discoveries?.includes("1:" + cache.id));
    a.s.emit("interact", cache.id);
    await pause(70);
    assert.equal(p.sparks, 25);
    assert.equal(live.players.get(b.s.id!)!.sparks, 0);
    p.x = 500;
    p.y = 155;
    a.s.emit("interact", "portal-north");
    await pause(70);
    assert.equal(p.floor, 2);
    assert.ok(p.visited?.includes(2));
    assert.equal(p.completed.length, 0);
    let chatB: Snapshot | undefined, chatC: Snapshot | undefined;
    b.s.on("world", (w) => (chatB = w));
    c.s.on("world", (w) => (chatC = w));
    a.s.emit("chat", "Hẹn nhau ở cổng!");
    await pause(150);
    assert.ok(chatB?.chat.some((m) => m.text === "Hẹn nhau ở cổng!"));
    assert.ok(!chatC?.chat.some((m) => m.text === "Hẹn nhau ở cổng!"));
    a.s.disconnect();
    await pause(60);
    const back = await connect("OPEN", "Vong trở lại", a.token);
    assert.equal(back.player.floor, 2);
    assert.equal(back.player.sparks, 25);
    assert.equal(back.player.maxFloor, 18);
    assert.deepEqual(back.player.discoveries, ["1:" + cache.id]);
  } finally {
    sockets.forEach((s) => s.disconnect());
    await new Promise<void>((r) => io.close(() => r()));
    rmSync(dir, { recursive: true, force: true });
  }
});
