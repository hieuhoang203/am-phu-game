import { test, expect } from "@playwright/test";
import { GAME_URL, enter, at, walk } from "./ui-helpers.mjs";
test("full-screen exploration, following camera, private loot, real portals and multiplayer chat", async ({
  browser,
}) => {
  test.setTimeout(65000);
  const ca = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    }),
    cb = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const a = await ca.newPage(),
    b = await cb.newPage(),
    errors = [];
  a.on("pageerror", (e) => errors.push(e.message));
  b.on("pageerror", (e) => errors.push(e.message));
  try {
    await a.goto(GAME_URL);
    await a.screenshot({ path: test.info().outputPath("welcome.png") });
    const room = "BROW-" + Date.now();
    await enter(a, "Mộc Miên", room);
    await enter(b, "Thanh Vân", room, "B");
    await expect(a.locator("[data-player]")).toHaveCount(2);
    await a.screenshot({
      path: test.info().outputPath("open-world-desktop.png"),
    });
    expect(await a.locator(".ow-game").boundingBox()).toEqual({
      x: 0,
      y: 0,
      width: 1440,
      height: 900,
    });
    expect(await a.locator("input[type=radio]").count()).toBe(0);
    await a.getByRole("button", { name: "Trò chuyện cùng phòng" }).click();
    await b.getByRole("button", { name: "Trò chuyện cùng phòng" }).click();
    await a
      .getByLabel("Tin nhắn", { exact: true })
      .fill("<img src=x onerror=alert(1)>");
    await a.getByRole("button", { name: "Gửi tin nhắn" }).click();
    await expect(b.locator(".ow-chat-log")).toContainText(
      "<img src=x onerror=alert(1)>",
    );
    await expect(b.locator(".ow-chat-log img")).toHaveCount(0);
    await a.getByRole("button", { name: "Thu gọn trò chuyện" }).click();
    const before = await a.locator(".ow-scene").getAttribute("data-camera");
    await walk(a, 945, 880);
    await expect
      .poll(() => a.locator(".ow-scene").getAttribute("data-camera"))
      .not.toBe(before);
    await expect(a.locator(".ow-top-left")).toContainText("25 đốm hồn");
    await expect(b.locator(".ow-top-left")).toContainText("0 đốm hồn");
    await a.screenshot({ path: test.info().outputPath("roaming.png") });
    await a.keyboard.press("m");
    await expect(a.locator(".ow-atlas button")).toHaveCount(18);
    await expect(a.locator(".ow-atlas button:disabled")).toHaveCount(0);
    await a.screenshot({ path: test.info().outputPath("atlas.png") });
    await a.locator(".ow-atlas button").nth(1).click();
    await expect(a.locator(".ow-location>span")).toContainText("02 / 18", {
      timeout: 25000,
    });
    await expect(a.locator(".ow-expedition")).toContainText("2/18");
    await expect(b.locator(".ow-location>span")).toContainText("01 / 18");
    await a.reload();
    await enterAfterReload(a);
    await expect(a.locator(".ow-location>span")).toContainText("02 / 18");
    expect(errors).toEqual([]);
  } finally {
    await ca.close();
    await cb.close();
  }
});
async function enterAfterReload(page) {
  await page.getByRole("button", { name: "Bắt đầu ngao du" }).click();
  await expect(page.locator(".ow-top-left")).toBeVisible();
}
test("mobile touch movement, atlas and settings remain usable", async ({
  browser,
}) => {
  const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    }),
    page = await context.newPage();
  try {
    await enter(page, "Vong bỏ túi");
    const p = await at(page),
      r = await page.locator(".ow-stick").boundingBox();
    await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
    await page.mouse.down();
    await page.mouse.move(r.x + r.width - 8, r.y + r.height / 2);
    await page.waitForTimeout(1000);
    await page.mouse.up();
    await expect
      .poll(async () => Math.round((await at(page)).x))
      .toBeGreaterThan(p.x + 80);
    await page.screenshot({
      path: test.info().outputPath("open-world-mobile.png"),
    });
    await page
      .getByRole("button", { name: "Bản đồ âm giới", exact: true })
      .click();
    await expect(page.locator(".ow-atlas button")).toHaveCount(18);
    await page.getByRole("button", { name: "Đóng", exact: true }).click();
    await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
    await page.getByRole("button", { name: "Ngoại hình", exact: true }).click();
    await page.screenshot({
      path: test.info().outputPath("mobile-appearance.png"),
    });
    await page.getByRole("button", { name: "Xong", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  } finally {
    await context.close();
  }
});
