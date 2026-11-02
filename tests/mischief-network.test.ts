import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Server } from "socket.io";
import { io as client, type Socket } from "socket.io-client";
import { attachGame } from "../server/game";
import type { Snapshot } from "../shared/world";
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
const waitFor = async (check: () => boolean) => {
  const stop = Date.now() + 6000;
  while (!check()) {
    if (Date.now() > stop) throw new Error("network condition timed out");
    await pause(30);
  }
};
const once = <T>(s: Socket, event: string) =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(event)), 3000);
    s.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
test("raw sockets cannot move, interact, travel or reincarnate while stunned; disconnect frees a dragged victim", async () => {
  const dir = mkdtempSync(join(tmpdir(), "prank-net-")),
    file = join(dir, "save.json"),
    token = "b".repeat(64),
    key = createHash("sha256").update(token).digest("hex");
  writeFileSync(
    file,
    JSON.stringify({ [key]: { name: "B", maxFloor: 2, completed: [1] } }),
  );
  const http = createServer(),
    io = new Server(http);
  attachGame(io, file);
  await new Promise<void>((r) => http.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${(http.address() as { port: number }).port}`;
  const a = client(url, { transports: ["websocket"] }),
    b = client(url, { transports: ["websocket"] });
  let wa: Snapshot = { players: [], lanterns: [], chat: [] },
    wb = wa;
  a.on("world", (s) => (wa = s));
  b.on("world", (s) => (wb = s));
  try {
    await Promise.all([once(a, "connect"), once(b, "connect")]);
    const aj = once(a, "joined"),
      bj = once(b, "joined");
    a.emit("join", { name: "A", team: "A", room: "NET" });
    b.emit("join", { name: "B", team: "B", room: "NET", token });
    await Promise.all([aj, bj]);
    await waitFor(() => wa.players.length === 2);
    const walk = async (
      s: Socket,
      state: () => Snapshot,
      x: number,
      y: number,
    ) => {
      for (let i = 0; i < 150; i++) {
        const p = state().players.find((p) => p.id === s.id)!;
        const dx = x - p.x,
          dy = y - p.y,
          d = Math.hypot(dx, dy);
        if (d < 5) return;
        await pause(55);
        s.emit("move", {
          x: p.x + (dx / d) * Math.min(9, d),
          y: p.y + (dy / d) * Math.min(9, d),
        });
      }
      throw new Error("walk timeout");
    };
    await Promise.all([
      walk(a, () => wa, 400, 440),
      walk(b, () => wb, 440, 440),
    ]);
    await waitFor(() =>
      wa.players.every((p) => (p.soul?.immuneUntil || 0) < Date.now()),
    );
    a.emit("mischief", { action: "drag", targetId: b.id });
    assert.match(await once<string>(a, "notice"), /choáng trước/);
    a.emit("mischief", { action: "bonk", targetId: b.id });
    await waitFor(
      () => wb.players.find((p) => p.id === b.id)?.soul?.combo === 1,
    );
    await pause(1150);
    a.emit("mischief", { action: "bonk", targetId: b.id });
    await waitFor(
      () => wb.players.find((p) => p.id === b.id)?.soul?.state === "stunned",
    );
    const before = { ...wb.players.find((p) => p.id === b.id)! };
    b.emit("move", { x: before.x + 2, y: before.y + 2 });
    await pause(100);
    assert.equal(wb.players.find((p) => p.id === b.id)!.x, before.x);
    for (const [event, data] of [
      ["interact", "arena"],
      ["travel", 2],
      ["reincarnate", undefined],
    ] as const) {
      const denied = once<string>(b, "notice");
      b.emit(event, data);
      assert.ok((await denied).length > 0);
      assert.equal(wb.players.find((p) => p.id === b.id)!.floor, 1);
    }
    a.emit("mischief", { action: "drag", targetId: b.id });
    await waitFor(
      () => wb.players.find((p) => p.id === b.id)?.soul?.state === "dragged",
    );
    a.disconnect();
    await waitFor(
      () => wb.players.length === 1 && wb.players[0].soul?.state === "free",
    );
    assert.equal(wb.players[0].soul?.draggedBy, undefined);
    assert.deepEqual(wb.players[0].completed, [1]);
    assert.ok(wb.players[0].soul!.immuneUntil > Date.now());
  } finally {
    a.disconnect();
    b.disconnect();
    await new Promise<void>((r) => io.close(() => r()));
    rmSync(dir, { recursive: true, force: true });
  }
});
