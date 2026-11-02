import { test, expect } from "@playwright/test";
test("three real souls: two-hit stun, slow drag, stage throw and teammate rescue", async ({
  browser,
}) => {
  const contexts = await Promise.all(
    [1, 2, 3].map(() =>
      browser.newContext({ viewport: { width: 1440, height: 1100 } }),
    ),
  );
  const [a, b, c] = await Promise.all(contexts.map((ctx) => ctx.newPage()));
  const errors = [];
  for (const p of [a, b, c]) p.on("pageerror", (e) => errors.push(e.message));
  const enter = async (p, name, team) => {
    await p.goto("http://localhost:3001");
    await p.getByRole("button", { name: "Bắt đầu ngao du" }).click();
    await p.getByLabel("Tên lữ khách").fill(name);
    await p.getByLabel("Mã phòng đồng hành").fill("TROLL-QA");
    await p.getByLabel("Chọn phe đồng hành").selectOption(team);
    await p.getByRole("button", { name: "Bước vào âm giới" }).click();
    await expect(p.getByRole("dialog")).toHaveCount(0);
  };
  await enter(a, "Quậy A", "A");
  await enter(b, "Quậy B", "B");
  await enter(c, "Cứu B", "B");
  const pos = async (p, name, axis) =>
    Number(
      await p
        .locator(`[data-player-name="${name}"]`)
        .getAttribute(`data-${axis}`),
    );
  const walk = async (p, name, x, y) => {
    await p.evaluate(() => document.activeElement?.blur());
    for (const [axis, value, negative, positive] of [
      ["x", x, "a", "d"],
      ["y", y, "w", "s"],
    ]) {
      const current = await pos(p, name, axis);
      if (Math.abs(current - value) < 15) continue;
      const key = current > value ? negative : positive;
      await p.keyboard.down(key);
      try {
        await expect
          .poll(async () => Math.abs((await pos(p, name, axis)) - value), {
            timeout: 8000,
            intervals: [50],
          })
          .toBeLessThan(17);
      } finally {
        await p.keyboard.up(key);
      }
    }
  };
  await walk(a, "Quậy A", 400, 440);
  await walk(b, "Quậy B", 442, 440);
  await walk(c, "Cứu B", 485, 480);
  await a
    .locator(".target-roster")
    .getByRole("button", { name: /Quậy B/ })
    .click();
  await expect(a.getByRole("button", { name: /R Kéo vong/ })).toBeDisabled();
  await a.getByRole("button", { name: /G Gõ đầu/ }).click();
  await expect(b.locator('[data-player-name="Quậy B"]')).toHaveAttribute(
    "data-soul-state",
    "free",
  );
  await expect(a.getByRole("button", { name: /G Gõ đầu/ })).toBeEnabled();
  await a.getByRole("button", { name: /G Gõ đầu/ }).click();
  await expect(b.locator('[data-player-name="Quậy B"]')).toHaveAttribute(
    "data-soul-state",
    "stunned",
  );
  // Sending real movement keys while stunned cannot move the victim.
  const before = await pos(b, "Quậy B", "x");
  await b.keyboard.down("d");
  await b.waitForTimeout(200);
  await b.keyboard.up("d");
  expect(await pos(b, "Quậy B", "x")).toBe(before);
  await a.getByRole("button", { name: /R Kéo vong/ }).click();
  await expect(b.locator('[data-player-name="Quậy B"]')).toHaveAttribute(
    "data-soul-state",
    "dragged",
  );
  await a.getByRole("button", { name: "Đưa tới vòng ném ↗" }).click();
  await expect(
    a.getByRole("button", { name: /T Ném vào hình phạt/ }),
  ).toBeEnabled();
  await a.getByRole("button", { name: /T Ném vào hình phạt/ }).click();
  await expect(b.locator('[data-player-name="Quậy B"]')).toHaveAttribute(
    "data-soul-state",
    "punished",
  );
  await c
    .locator(".target-roster")
    .getByRole("button", { name: /Quậy B/ })
    .click();
  await c.getByRole("button", { name: /C Cứu vong/ }).click();
  await expect(b.locator('[data-player-name="Quậy B"]')).toHaveAttribute(
    "data-soul-state",
    "free",
  );
  await expect(a.locator(".team-scoreboard>div").first()).toContainText("4");
  await expect(c.locator(".team-scoreboard>div").nth(1)).toContainText("2");
  await a.locator(".mischief-panel").scrollIntoViewIfNeeded();
  await a.screenshot({
    path: test.info().outputPath("prank-multiplayer-v3.png"),
    fullPage: true,
  });
  await b.setViewportSize({ width: 390, height: 844 });
  expect(
    await b.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
  await b.locator(".mischief-panel").scrollIntoViewIfNeeded();
  await b.screenshot({
    path: test.info().outputPath("prank-mobile-v3.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
  await Promise.all(contexts.map((ctx) => ctx.close()));
});
