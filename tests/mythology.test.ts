import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Server } from "socket.io";
import { io as client, type Socket } from "socket.io-client";
import { attachGame } from "../server/game";
import {
  characters,
  punishments,
  realms,
  characterById,
} from "../shared/mythology";
import { floors, WORLD, type Player, type Snapshot } from "../shared/world";
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
const once = <T>(s: Socket, event: string) =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timeout: ${event}`)),
      4000,
    );
    s.once(event, (v) => {
      clearTimeout(timer);
      resolve(v);
    });
  });
test("complete cast and stage models keep the selected folk order distinct from the ten courts", () => {
  assert.equal(characters.length, 19);
  assert.equal(new Set(characters.map((c) => c.id)).size, 19);
  assert.deepEqual(
    characters.filter((c) => c.kind === "king").map((c) => c.court),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  );
  assert.equal(characterById("nguu-dau").kind, "ox");
  assert.equal(characterById("ma-dien").kind, "horse");
  assert.equal(characterById("king-10").name, "Chuyển Luân Vương");
  assert.equal(punishments.length, 18);
  assert.equal(new Set(punishments.map((p) => p.title)).size, 18);
  assert.equal(realms.length, 6);
  for (const [i, p] of punishments.entries()) {
    assert.equal(p.floor, i + 1);
    assert.equal(floors[i].elements.length, 3);
    assert.equal(characterById(p.guardian).id, p.guardian);
    assert.ok(
      readFileSync(
        `public/models/punishments/floor-${String(p.floor).padStart(2, "0")}.svg`,
        "utf8",
      ).includes(`data-punishment="${p.floor}"`),
    );
  }
  for (const c of characters)
    for (const pose of ["", "-work", "-surprised"])
      assert.ok(
        readFileSync(
          `public/models/characters/${c.id}${pose}.svg`,
          "utf8",
        ).includes(`data-character="${c.id}"`),
      );
});
test("reincarnation requires all seals and the last gate, resets only this journey and persists cycle count", async () => {
  const dir = mkdtempSync(join(tmpdir(), "ap-cycle-")),
    file = join(dir, "progress.json"),
    token = "a".repeat(64),
    key = createHash("sha256").update(token).digest("hex");
  writeFileSync(
    file,
    JSON.stringify({
      [key]: {
        name: "Đã đủ ấn",
        maxFloor: 18,
        completed: floors.map((f) => f.id),
      },
    }),
  );
  const http = createServer(),
    io = new Server(http);
  attachGame(io, file);
  await new Promise<void>((r) => http.listen(0, "127.0.0.1", r));
  const s = client(
    `http://127.0.0.1:${(http.address() as { port: number }).port}`,
    { transports: ["websocket"] },
  );
  let world: Snapshot = { players: [], lanterns: [], chat: [] };
  s.on("world", (w) => (world = w));
  try {
    await once(s, "connect");
    const joining = once(s, "joined");
    s.emit("join", { name: "Đã đủ ấn", room: "CYCLE", token });
    await joining;
    await pause(30);
    const denied = once<string>(s, "notice");
    s.emit("reincarnate");
    assert.match(await denied, /cổng tầng 18/);
    const walk = async () => {
      for (let i = 0; i < 100; i++) {
        const p = world.players.find((p) => p.id === s.id)!;
        const dx = WORLD.gate.x - p.x,
          dy = WORLD.gate.y - p.y,
          d = Math.hypot(dx, dy);
        if (d < 8) return;
        await pause(55);
        s.emit("move", {
          x: p.x + (dx / d) * Math.min(9, d),
          y: p.y + (dy / d) * Math.min(9, d),
        });
        await pause(5);
      }
      throw new Error("walk timeout");
    };
    await walk();
    s.emit("travel", 18);
    await pause(60);
    assert.equal(world.players[0].floor, 18);
    const far = once<string>(s, "notice");
    s.emit("reincarnate");
    assert.match(await far, /cổng tầng 18/);
    await walk();
    const reborn = once<{ cycles: number }>(s, "reincarnated");
    s.emit("reincarnate");
    assert.equal((await reborn).cycles, 1);
    await pause(60);
    const p = world.players.find((p) => p.id === s.id)!;
    assert.equal(p.floor, 1);
    assert.equal(p.maxFloor, 1);
    assert.deepEqual(p.completed, []);
    assert.equal(p.cycles, 1);
    assert.equal(JSON.parse(readFileSync(file, "utf8"))[key].cycles, 1);
    const twice = once<string>(s, "notice");
    s.emit("reincarnate");
    assert.match(await twice, /18 ấn/);
    s.disconnect();
    await pause(50);
    s.connect();
    await once(s, "connect");
    const reload = once<{ player: Player }>(s, "joined");
    s.emit("join", { name: "Quay lại", room: "CYCLE", token });
    const back = (await reload).player;
    assert.equal(back.cycles, 1);
    assert.equal(back.maxFloor, 1);
  } finally {
    s.disconnect();
    await new Promise<void>((r) => io.close(() => r()));
    rmSync(dir, { recursive: true, force: true });
  }
});
