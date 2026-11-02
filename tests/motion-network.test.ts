import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Server } from "socket.io";
import { io as client } from "socket.io-client";
import { attachGame } from "../server/game";
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
test("input protocol acknowledges once, enforces elapsed-time speed, rejects invalid input and obeys stun and region changes", async () => {
  const dir = mkdtempSync(join(tmpdir(), "motion-net-")),
    http = createServer(),
    io = new Server(http),
    { rooms } = attachGame(io, join(dir, "save.json"));
  await new Promise<void>((r) => http.listen(0, "127.0.0.1", r));
  const s = client(
    "http://127.0.0.1:" + (http.address() as { port: number }).port,
    { transports: ["websocket"] },
  );
  try {
    await new Promise<void>((r) => s.once("connect", r));
    const ready = new Promise((r) => s.once("joined", r));
    s.emit("join", { name: "Motion QA", room: "MOTION" });
    await ready;
    const p = rooms.get("MOTION")!.players.get(s.id!)!;
    const c = { seq: 1, floor: 1, dx: 1, dy: 0, dt: 40 };
    s.emit("input", [c]);
    await pause(70);
    assert.equal(p.inputSeq, 1);
    assert.equal(p.x, 510);
    s.emit("input", [c]);
    await pause(30);
    assert.equal(p.x, 510, "duplicate input never moves twice");
    s.emit("input", [{ ...c, seq: 2, dt: 5000 }]);
    s.emit("input", [{ ...c, seq: 2, dx: 2 }]);
    s.emit(
      "input",
      Array.from({ length: 9 }, () => c),
    );
    await pause(30);
    assert.equal(p.inputSeq, 1);
    const x = p.x,
      start = Date.now();
    for (let batch = 0; batch < 10; batch++)
      s.emit(
        "input",
        Array.from({ length: 8 }, (_, i) => ({ ...c, seq: 2 + batch * 8 + i })),
      );
    await pause(60);
    assert.ok(
      p.x - x <= 250 * ((Date.now() - start) / 1000 + 0.15) + 1,
      "packet bursts cannot manufacture movement time",
    );
    const before = p.x;
    s.emit("move", { x: p.x + 50, y: p.y });
    await pause(30);
    assert.equal(
      p.x,
      before,
      "legacy absolute moves cannot bypass input accounting",
    );
    p.soul!.state = "stunned";
    p.soul!.until = Date.now() + 5000;
    s.emit("input", [{ ...c, seq: 100 }]);
    await pause(30);
    assert.equal(p.x, before);
    assert.equal(p.inputSeq, 100);
    p.soul!.state = "free";
    p.floor = 2;
    s.emit("input", [{ ...c, seq: 101 }]);
    await pause(30);
    assert.equal(
      p.x,
      before,
      "late packets from the previous region are discarded",
    );
  } finally {
    s.disconnect();
    await new Promise<void>((r) => io.close(() => r()));
    rmSync(dir, { recursive: true, force: true });
  }
});

