import { test, expect } from "@playwright/test";
import { enter, at } from "./ui-helpers.mjs";
import fs from "node:fs";
test("movement remains responsive with 100ms delay each way; peers interpolate and settle at the same position", async ({
  browser,
}) => {
  const contexts = await Promise.all(
      [1, 2].map(() =>
        browser.newContext({ viewport: { width: 1440, height: 900 } }),
      ),
    ),
    [a, b] = await Promise.all(contexts.map((c) => c.newPage()));
  const errors = [];
  for (const p of [a, b]) {
    p.on("pageerror", (e) => errors.push(e.message));
    await p.addInitScript(() => {
      const Native = window.WebSocket;
      window.WebSocket = class extends Native {
        set onmessage(fn) {
          super.onmessage = fn
            ? (e) => setTimeout(() => fn.call(this, e), 100)
            : null;
        }
        get onmessage() {
          return super.onmessage;
        }
        send(data) {
          setTimeout(() => {
            if (this.readyState === 1) super.send(data);
          }, 100);
        }
      };
    });
  }
  try {
    const room = "SMOOTH-" + Date.now();
    await enter(a, "Lướt A", room);
    await enter(b, "Lướt B", room, "B");
    await expect(b.locator("[data-player]")).toHaveCount(2);
    await a.waitForTimeout(1100);
    const trace = async (p) =>
      p.evaluate(() => {
        window.trace = [];
        window.started = 0;
        window.addEventListener(
          "keydown",
          () => {
            window.started = performance.now();
          },
          { once: true },
        );
        const end = performance.now() + 1500;
        function frame(t) {
          const n = [...document.querySelectorAll("[data-player]")].find((n) =>
            n.textContent.includes("Lướt A"),
          );
          if (n)
            window.trace.push({
              t,
              x: +n.getAttribute("transform").match(/translate\(([-\d.]+)/)[1],
            });
          if (t < end) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    await Promise.all([trace(a), trace(b)]);
    await a.keyboard.down("d");
    await a.waitForTimeout(1200);
    await a.keyboard.up("d");
    const metrics = async (p) =>
      p.evaluate(() => {
        const a = window.trace,
          first = a.find((f) => f.x > a[0].x + 0.1);
        return {
          inputDelayMs:
            first && window.started
              ? Math.round(first.t - window.started)
              : null,
          frames: a.length,
          changes: a.filter((f, i) => i && Math.abs(f.x - a[i - 1].x) > 0.01)
            .length,
          distance: a.at(-1).x - a[0].x,
        };
      });
    const local = await metrics(a),
      remote = await metrics(b);
    expect(local.inputDelayMs).toBeLessThan(100);
    expect(local.distance).toBeGreaterThan(220);
    expect(local.changes / local.frames).toBeGreaterThan(0.6);
    expect(remote.changes / remote.frames).toBeGreaterThan(0.35);
    await a.waitForTimeout(800);
    const mine = await at(a),
      observed = await b
        .locator("[data-player]")
        .filter({ hasText: "Lướt A" })
        .getAttribute("transform");
    const remoteX = +observed.match(/translate\(([-\d.]+)/)[1];
    expect(Math.abs(mine.x - remoteX)).toBeLessThan(2);
    await a.getByRole("button", { name: "Đỡ đòn", exact: true }).click();
    await expect(
      a.getByRole("button", { name: "Đỡ đòn", exact: true }),
    ).toHaveClass(/ow-action-pressed/);
    expect(errors).toEqual([]);
    fs.writeFileSync(
      test.info().outputPath("motion-metrics.json"),
      JSON.stringify(
        {
          delayEachWayMs: 100,
          local,
          remote,
          settledDifference: Math.abs(mine.x - remoteX),
        },
        null,
        2,
      ),
    );
  } finally {
    await Promise.all(contexts.map((c) => c.close()));
  }
});
