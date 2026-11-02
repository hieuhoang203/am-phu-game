import { test, expect } from "@playwright/test";
import { enter, walk, at } from "./ui-helpers.mjs";
test("three souls can stun, drag, throw, rescue and compare team scores in the open world", async ({
  browser,
}) => {
  test.setTimeout(50000);
  const contexts = await Promise.all(
      [1, 2, 3].map(() =>
        browser.newContext({ viewport: { width: 1440, height: 900 } }),
      ),
    ),
    [a, b, c] = await Promise.all(contexts.map((x) => x.newPage())),
    errors = [];
  for (const p of [a, b, c]) p.on("pageerror", (e) => errors.push(e.message));
  try {
    const room = "TROLL-" + Date.now();
    await enter(a, "Quậy A", room, "A");
    await enter(b, "Quậy B", room, "B");
    await enter(c, "Cứu B", room, "B");
    await Promise.all([
      walk(a, 400, 440),
      walk(b, 442, 440),
      walk(c, 430, 480),
    ]);
    await a.waitForTimeout(2600);
    const victim = await at(b);
    await a
      .locator(`[data-player="${victim.id}"]`)
      .dispatchEvent("pointerdown", { button: 0 });
    await expect(a.locator(".ow-target")).toContainText("Quậy B");
    await expect(
      a.getByRole("button", { name: "Kéo vong", exact: true }),
    ).toBeDisabled();
    await a.getByRole("button", { name: "Gõ đầu", exact: true }).click();
    await a.waitForTimeout(1200);
    await a.getByRole("button", { name: "Gõ đầu", exact: true }).click();
    await expect(b.locator(`[data-player="${victim.id}"]`)).toHaveClass(
      /state-stunned/,
    );
    const before = await at(b);
    await b.keyboard.down("d");
    await b.waitForTimeout(150);
    await b.keyboard.up("d");
    expect((await at(b)).x).toBe(before.x);
    await a.getByRole("button", { name: "Kéo vong", exact: true }).click();
    await expect(b.locator(`[data-player="${victim.id}"]`)).toHaveClass(
      /state-dragged/,
    );
    await expect(a.locator(".soul-body-state")).not.toHaveCount(0);
    await walk(a, 435, 450);
    await a
      .getByRole("button", { name: "Ném vào hình phạt", exact: true })
      .click();
    await expect(b.locator(`[data-player="${victim.id}"]`)).toHaveClass(
      /state-punished/,
    );
    await a.screenshot({
      path: test.info().outputPath("open-world-prank.png"),
    });
    await c
      .locator(`[data-player="${victim.id}"]`)
      .dispatchEvent("pointerdown", { button: 0 });
    await c.getByRole("button", { name: "Cứu vong", exact: true }).click();
    await expect(b.locator(`[data-player="${victim.id}"]`)).toHaveClass(
      /state-free/,
    );
    await a.getByRole("button", { name: "Bạn đồng hành", exact: true }).click();
    await expect(a.locator(".ow-party-scores")).toContainText("Hội Đèn Lồng");
    await a.screenshot({ path: test.info().outputPath("team-scores.png") });
    expect(errors).toEqual([]);
  } finally {
    await Promise.all(contexts.map((x) => x.close()));
  }
});
