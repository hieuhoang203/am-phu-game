import { test } from "node:test";
import assert from "node:assert/strict";
import { findForeignGlyphs } from "../scripts/check-vietnamese";
import { floors } from "../shared/world";
import { characters, realms } from "../shared/mythology";
test("project source, documents, export tools and assets use Vietnamese labels without foreign ideographs", () => {
  assert.deepEqual(findForeignGlyphs(process.cwd()), []);
  assert.equal(floors.length, 18);
  assert.equal(characters.length, 19);
  assert.equal(realms.length, 6);
  for (const item of [...floors, ...characters, ...realms]) {
    assert.ok(item.name.trim());
    assert.equal(Object.hasOwn(item, "han"), false);
  }
});
