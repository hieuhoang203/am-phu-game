import { test, expect } from "@playwright/test";
const GAME_URL = process.env.GAME_URL || "http://localhost:3001";
test("settings persist, all four tabs work, appearance is visible to a second player and audio gains respond", async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
  });
  await ctx.addInitScript(() => {
    window.__audioContexts = [];
    window.__audioGains = [];
    const Native = window.AudioContext;
    window.AudioContext = class extends Native {
      constructor(...args) {
        super(...args);
        window.__audioContexts.push(this);
      }
      createGain() {
        const g = super.createGain();
        window.__audioGains.push(g);
        return g;
      }
    };
  });
  const page = await ctx.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(GAME_URL);
  await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Cài đặt" })).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Bật âm thanh", exact: true })
    .click();
  const master = page.getByRole("slider", { name: /Âm lượng tổng/ });
  await master.press("Home");
  await expect(master).toHaveValue("0");
  await expect(
    page.getByRole("button", { name: "Nghe thử hiệu ứng" }),
  ).toBeDisabled();
  await master.press("End");
  await expect(master).toHaveValue("100");
  await page.getByRole("button", { name: "Nghe thử hiệu ứng" }).click();
  await expect
    .poll(() => page.evaluate(() => window.__audioContexts[0]?.state))
    .toBe("running");
  await expect
    .poll(() =>
      page.evaluate(() => Math.round(window.__audioGains[0].gain.value * 100)),
    )
    .toBe(100);
  const music = page.getByRole("slider", { name: /Âm nền/ });
  await music.press("Home");
  await expect
    .poll(() =>
      page.evaluate(() => Math.round(window.__audioGains[1].gain.value * 1000)),
    )
    .toBe(0);
  const effects = page.getByRole("slider", { name: /Hiệu ứng tương tác/ });
  await effects.press("Home");
  await expect(
    page.getByRole("button", { name: "Nghe thử hiệu ứng" }),
  ).toBeDisabled();
  await effects.press("End");
  await expect(effects).toHaveValue("100");
  await page.getByRole("button", { name: "Nghe thử hiệu ứng" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => Math.round(window.__audioGains[2].gain.value * 100)),
    )
    .toBe(12);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect
    .poll(() =>
      page.evaluate(() => Math.round(window.__audioGains[0].gain.value * 100)),
    )
    .toBe(0);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect
    .poll(() =>
      page.evaluate(() => Math.round(window.__audioGains[0].gain.value * 100)),
    )
    .toBe(100);
  await page.screenshot({
    path: test.info().outputPath("settings-audio-0.4.png"),
  });
  await page.getByRole("button", { name: /^Ngoại hình/ }).click();
  await page.getByRole("button", { name: "Khói tím", exact: true }).click();
  await page.getByRole("button", { name: "Tinh nghịch", exact: true }).click();
  await page.getByRole("button", { name: "Hoa sen", exact: true }).click();
  await page.getByRole("button", { name: "Vòng tinh tú", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Khói tím", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({
    path: test.info().outputPath("settings-appearance-0.4.png"),
  });
  await page.getByRole("button", { name: /^Hiển thị/ }).click();
  await page
    .getByRole("checkbox", { name: "Giảm chuyển động", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "Hạt sáng trong cảnh", exact: true })
    .uncheck();
  await page
    .getByRole("checkbox", { name: "Nút thao tác lớn", exact: true })
    .check();
  await expect(page.locator(".ow-game")).toHaveClass(/reduce-motion/);
  await expect(page.locator(".ow-game")).not.toHaveClass(/no-particles/);
  await page.getByRole("button", { name: /^Điều khiển/ }).click();
  await expect(page.locator(".control-reference")).toContainText("Space");
  await page.getByRole("button", { name: "Đóng", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
  await expect(page.getByRole("slider", { name: /Âm lượng tổng/ })).toHaveValue(
    "100",
  );
  await page.getByRole("button", { name: /^Ngoại hình/ }).click();
  await expect(
    page.getByRole("button", { name: "Hoa sen", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Đóng", exact: true }).click();
  const enter = async (p, name) => {
    await p.getByLabel("Tên âm hồn").fill(name);
    await p
      .getByLabel("Mã phòng")
      .fill("SET-" + Date.now().toString().slice(0, -6));
    await p.getByRole("button", { name: "Bắt đầu ngao du" }).click();
    await expect(p.locator(".ow-top-left")).toBeVisible();
  };
  await enter(page, "Hồn Tím");
  const peerCtx = await browser.newContext({
      viewport: { width: 1440, height: 1050 },
    }),
    peer = await peerCtx.newPage();
  await peer.goto(GAME_URL);
  await enter(peer, "Người Xem");
  await expect(
    peer
      .locator("[data-player]")
      .filter({ hasText: "Hồn Tím" })
      .locator(".soul-accessory"),
  ).toHaveCount(1);
  await expect(
    peer
      .locator("[data-player]")
      .filter({ hasText: "Hồn Tím" })
      .locator(".aura-orbit"),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
  await page.getByRole("button", { name: /^Ngoại hình/ }).click();
  await page.getByRole("button", { name: "Đèn hổ phách", exact: true }).click();
  await expect(page.getByText("Đã đồng bộ", { exact: true })).toBeVisible();
  await expect(
    peer
      .locator("[data-player]")
      .filter({ hasText: "Hồn Tím" })
      .locator(".character-sprite stop")
      .first(),
  ).toHaveAttribute("stop-color", "#d1ae70");
  await page.getByRole("button", { name: "Đóng", exact: true }).click();
  await expect(page.locator(".ow-hotbar button")).toHaveCount(9);
  await expect(page.locator(".ow-firefly")).toHaveCount(0);
  await page.screenshot({
    path: test.info().outputPath("controls-open-world.png"),
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: /^Ngoại hình/ }).click();
  expect(
    await page
      .locator(".ow-settings")
      .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  ).toBeTruthy();
  await expect(
    page.getByRole("button", { name: "Xong", exact: true }),
  ).toBeInViewport({ ratio: 1 });
  await page.screenshot({
    path: test.info().outputPath("settings-mobile-0.4.png"),
  });
  await page
    .getByRole("button", { name: "Khôi phục mặc định", exact: true })
    .click();
  await expect(page.locator(".ow-game")).not.toHaveClass(/reduce-motion/);
  await expect(
    page.getByRole("button", { name: "Ngọc bích", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Xong", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(errors).toEqual([]);
  await ctx.close();
  await peerCtx.close();
});
