import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:net";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const check = (port: string) =>
  run(process.execPath, ["scripts/check-port.mjs"], {
    env: { ...process.env, PORT: port },
    timeout: 5000,
  });

test("startup reports an occupied port without starting another game server; a free port is released after checking", async () => {
  const occupied = createServer();
  await new Promise<void>((resolve) => occupied.listen(0, "0.0.0.0", resolve));
  const port = (occupied.address() as { port: number }).port;
  try {
    await assert.rejects(check(String(port)), (error: unknown) => {
      const failure = error as { code: number; stderr: string };
      assert.equal(failure.code, 1);
      assert.ok(failure.stderr.includes(`Cổng ${port} đang được sử dụng`));
      assert.ok(!failure.stderr.includes("Unhandled"));
      return true;
    });
    assert.ok(occupied.listening, "The existing listener stays intact");
  } finally {
    await new Promise<void>((resolve) => occupied.close(() => resolve()));
  }
  await check(String(port));
  const next = createServer();
  await new Promise<void>((resolve) => next.listen(port, "0.0.0.0", resolve));
  await new Promise<void>((resolve) => next.close(() => resolve()));
});

test("startup rejects invalid PORT values with a readable message", async () => {
  for (const port of ["0", "65536", "3001.5", "abc"]) {
    await assert.rejects(check(port), (error: unknown) => {
      const failure = error as { code: number; stderr: string };
      assert.equal(failure.code, 1);
      assert.ok(failure.stderr.includes("PORT phải là số nguyên"));
      return true;
    });
  }
});
