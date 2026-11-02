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
test("18 unique floors have valid adaptation content and puzzle answers", () => {
  assert.equal(floors.length, 18);
  assert.equal(new Set(floors.map((f) => f.han)).size, 18);
  for (const [i, floor] of floors.entries()) {
    assert.equal(floor.id, i + 1);
    assert.equal(floor.elements.length, 3);
    assert.ok(floor.choices[floor.answer]);
  }
});
test("real multiplayer: shared lamps, chat, movement limits, progression, reconnect and persistence", async () => {
  const temp = mkdtempSync(join(tmpdir(), "am-phu-test-"));
  const save = join(temp, "progress.json");
  const http = createServer();
  const io = new Server(http);
  attachGame(io, save);
  await new Promise<void>((r) => http.listen(0, "127.0.0.1", r));
  const address = http.address() as { port: number };
  const url = `http://127.0.0.1:${address.port}`;
  const clients: Socket[] = [];
  const connect = async () => {
    const socket = client(url, { transports: ["websocket"], forceNew: true });
    clients.push(socket);
    await once(socket, "connect");
    return socket;
  };
  try {
    const a = await connect(),
      b = await connect(),
      outsider = await connect();
    let wa: Snapshot = { players: [], lanterns: [], chat: [] },
      wb = wa,
      wo = wa;
    a.on("world", (v) => (wa = v));
    b.on("world", (v) => (wb = v));
    outsider.on("world", (v) => (wo = v));
    const first = once<{ player: Player; token: string }>(a, "joined");
    a.emit("join", { name: "Lữ khách A", room: "TEST" });
    const { token } = await first;
    const second = once(b, "joined");
    b.emit("join", { name: "Lữ khách B", room: "TEST" });
    await second;
    const third = once(outsider, "joined");
    outsider.emit("join", { name: "Khác phòng", room: "OTHER" });
    await third;
    await pause(50);
    assert.equal(wa.players.length, 2);
    assert.equal(wb.players.length, 2);
    assert.equal(wo.players.length, 1);
    a.emit("move", { x: 850, y: 150 });
    await pause(70);
    assert.equal(
      wb.players.find((p) => p.id === a.id)!.y,
      550,
      "teleport rejected",
    );
    const locked = once<string>(a, "notice");
    a.emit("travel", 18);
    assert.match(await locked, /chưa được mở/);
    const tooFar = once<string>(a, "notice");
    a.emit("interact", 0);
    assert.match(await tooFar, /gần đèn/);
    a.emit("chat", "<script>alert(1)</script>");
    await pause(60);
    assert.equal(wb.chat.at(-1)?.text, "<script>alert(1)</script>");
    assert.ok(!wo.chat.some((m) => m.text.includes("<script>")));
    const walk = async (
      socket: Socket,
      state: () => Snapshot,
      target: { x: number; y: number },
    ) => {
      for (let i = 0; i < 180; i++) {
        const p = state().players.find((p) => p.id === socket.id)!;
        const dx = target.x - p.x,
          dy = target.y - p.y,
          d = Math.hypot(dx, dy);
        if (d < 9) return;
        await pause(55);
        socket.emit("move", {
          x: p.x + (dx / d) * Math.min(9, d),
          y: p.y + (dy / d) * Math.min(9, d),
        });
        await pause(5);
      }
      throw new Error("Walk timed out");
    };
    await walk(a, () => wa, WORLD.lanterns[0]);
    a.emit("interact", 0);
    await pause(70);
    assert.equal(wb.lanterns[0], true);
    await walk(b, () => wb, WORLD.lanterns[1]);
    b.emit("interact", 1);
    await pause(70);
    assert.deepEqual(wa.lanterns, [true, true]);
    assert.deepEqual(wo.lanterns, [false, false]);
    await walk(a, () => wa, WORLD.npc);
    const wrong = once<string>(a, "notice");
    a.emit("answer", 2);
    assert.match(await wrong, /nghĩ thêm/);
    const right = once<string>(a, "notice");
    a.emit("answer", floors[0].answer);
    await right;
    await pause(50);
    assert.equal(wa.players.find((p) => p.id === a.id)!.maxFloor, 2);
    assert.equal(wb.players.find((p) => p.id === b.id)!.maxFloor, 1);
    await walk(a, () => wa, WORLD.gate);
    a.emit("travel", 2);
    await pause(80);
    assert.equal(wa.players[0].floor, 2);
    assert.equal(wb.players.length, 1);
    assert.deepEqual(wa.lanterns, [false, false]);
    a.disconnect();
    await pause(80);
    const again = await connect();
    const restored = once<{ player: Player }>(again, "joined");
    again.emit("join", { name: "Trở lại", room: "TEST", token });
    const restoredPlayer = (await restored).player;
    assert.equal(restoredPlayer.maxFloor, 2);
    assert.deepEqual(restoredPlayer.completed, [1]);
    again.disconnect();
    await pause(80);
    // A second isolated game server reads the saved progress from disk.
    const http2 = createServer();
    const io2 = new Server(http2);
    attachGame(io2, save);
    await new Promise<void>((r) => http2.listen(0, "127.0.0.1", r));
    const c = client(
      `http://127.0.0.1:${(http2.address() as { port: number }).port}`,
      { transports: ["websocket"] },
    );
    clients.push(c);
    await once(c, "connect");
    const disk = once<{ player: Player }>(c, "joined");
    c.emit("join", { name: "Sau restart", room: "TEST", token });
    assert.equal((await disk).player.maxFloor, 2);
    c.disconnect();
    await new Promise<void>((r) => io2.close(() => r()));
  } finally {
    clients.forEach((s) => s.disconnect());
    await new Promise<void>((r) => io.close(() => r()));
    rmSync(temp, { recursive: true, force: true });
  }
});
