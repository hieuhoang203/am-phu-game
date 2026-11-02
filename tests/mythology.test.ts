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
