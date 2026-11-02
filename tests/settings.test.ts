import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Server } from "socket.io";
import { io as client, type Socket } from "socket.io-client";
import {
  normalizeAppearance,
  defaultAppearance,
  validAppearance,
  type SoulAppearance,
} from "../shared/customization";
import { normalizeSettings, defaultSettings } from "../src/settings";
import { attachGame } from "../server/game";
import type { Snapshot, Player } from "../shared/world";
test("settings normalize corrupted storage, clamp audio and reject arbitrary appearance input", () => {
  assert.deepEqual(normalizeSettings(null), defaultSettings);
  const s = normalizeSettings({
    audio: { master: 250, music: -10, effects: "100", muted: "no" },
    display: { showNames: false, particles: "yes" },
    appearance: { palette: "<script>", hat: "https://evil" },
  });
  assert.equal(s.audio.master, 100);
  assert.equal(s.audio.music, 0);
  assert.equal(s.audio.effects, 65);
  assert.equal(s.audio.muted, true);
  assert.equal(s.display.showNames, false);
  assert.equal(s.display.particles, true);
  assert.deepEqual(s.appearance, defaultAppearance);
  assert.equal(validAppearance({ palette: "jade" }), false);
  assert.equal(
    validAppearance({ ...defaultAppearance, palette: "__proto__" }),
    false,
  );
  assert.deepEqual(normalizeAppearance([]), defaultAppearance);
});
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
const once = <T>(s: Socket, event: string) =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(event)), 4000);
    s.once(event, (value) => {
      clearTimeout(timer);
      resolve(value);
    });
  });
test("appearance is broadcast, saved, validated and retained through reincarnation and reconnect", async () => {
  const dir = mkdtempSync(join(tmpdir(), "ap-look-")),
    file = join(dir, "save.json"),
    token = "c".repeat(64),
    key = createHash("sha256").update(token).digest("hex");
  const original: SoulAppearance = {
      palette: "ice",
      eyes: "sleepy",
      hat: "leaf",
      aura: "mist",
    },
    changed: SoulAppearance = {
      palette: "lilac",
      eyes: "cheeky",
      hat: "lantern",
      aura: "orbit",
    };
  writeFileSync(
    file,
    JSON.stringify({
      [key]: {
        name: "Look",
        maxFloor: 18,
        completed: Array.from({ length: 18 }, (_, i) => i + 1),
        appearance: original,
      },
    }),
  );
  const http = createServer(),
    io = new Server(http);
  attachGame(io, file);
  await new Promise<void>((r) => http.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${(http.address() as { port: number }).port}`;
  const a = client(url, { transports: ["websocket"] }),
    b = client(url, { transports: ["websocket"] });
  let world: Snapshot = { players: [], lanterns: [], chat: [] };
  a.on("world", (w) => (world = w));
  let peer: Snapshot = world;
  b.on("world", (w) => (peer = w));
  try {
    await Promise.all([once(a, "connect"), once(b, "connect")]);
    const ready = once<{ player: Player }>(a, "joined"),
      other = once(b, "joined");
    a.emit("join", { name: "Look", room: "LOOK", token });
    b.emit("join", { name: "Peer", room: "LOOK" });
    assert.deepEqual((await ready).player.appearance, original);
    await other;
    const invalid = once<string>(a, "appearance-error");
    a.emit("appearance", { ...changed, palette: "url(javascript:bad)" });
    await invalid;
    assert.deepEqual(
      world.players.find((p) => p.id === a.id)!.appearance,
      original,
    );
    const saved = once<{ appearance: SoulAppearance }>(a, "appearance-saved");
    a.emit("appearance", changed);
    assert.deepEqual((await saved).appearance, changed);
    await pause(80);
    assert.deepEqual(
      peer.players.find((p) => p.id === a.id)!.appearance,
      changed,
    );
    assert.deepEqual(
      JSON.parse(readFileSync(file, "utf8"))[key].appearance,
      changed,
    );
    const walk = async () => {
      for (let i = 0; i < 100; i++) {
        const p = world.players.find((p) => p.id === a.id)!;
        const dx = 500 - p.x,
          dy = 155 - p.y,
          d = Math.hypot(dx, dy);
        if (d < 9) return;
        await pause(55);
        a.emit("move", {
          x: p.x + (dx / d) * Math.min(d, 9),
          y: p.y + (dy / d) * Math.min(d, 9),
        });
        await pause(5);
      }
      throw new Error("walk timed out");
    };
    await walk();
    a.emit("travel", 18);
    await pause(80);
    await walk();
    const cycle = once(a, "reincarnated");
    a.emit("reincarnate");
    await cycle;
    await pause(70);
    assert.deepEqual(
      JSON.parse(readFileSync(file, "utf8"))[key].appearance,
      changed,
    );
    assert.deepEqual(
      world.players.find((p) => p.id === a.id)!.appearance,
      changed,
    );
    a.disconnect();
    await pause(50);
    a.connect();
    await once(a, "connect");
    const rejoined = once<{ player: Player }>(a, "joined");
    a.emit("join", { name: "Look", room: "LOOK", token });
    assert.deepEqual((await rejoined).player.appearance, changed);
  } finally {
    a.disconnect();
    b.disconnect();
    await new Promise<void>((r) => io.close(() => r()));
    rmSync(dir, { recursive: true, force: true });
  }
});
