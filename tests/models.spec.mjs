import { test, expect } from "@playwright/test";
test("model library, all 18 scenes, source details and six realms work on desktop and mobile", async ({
  browser,
}) => {
  const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("http://localhost:3001");
  await page
    .getByRole("button", { name: "Đồ giám nhân vật và hình phạt" })
    .click();
  await expect(page.locator(".character-grid button")).toHaveCount(19);
  await expect(
    page.getByRole("heading", { name: "Ngưu Đầu", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ngạc nhiên", exact: true }).click();
  await expect(page.locator(".model-portrait .pose-surprised")).toHaveCount(1);
  await page
    .locator(".pose-controls")
    .getByRole("button", { name: "Dừng", exact: true })
    .click();
  expect(
    await page
      .locator(".model-portrait .sprite-body")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page
    .locator(".pose-controls")
    .getByRole("button", { name: "Chạy", exact: true })
    .click();
  await page.screenshot({
    path: test.info().outputPath("character-library-v2.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Mã Diện 馬面" }).click();
  await expect(
    page.getByRole("heading", { name: "Mã Diện", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Hình phạt · 18" }).click();
  for (let i = 1; i <= 18; i++) {
    await page.getByLabel("Chọn model hình phạt").selectOption(String(i));
    await expect(
      page.locator(`.punishment-portrait [data-punishment="${i}"]`),
    ).toHaveCount(1);
  }
  await page.getByLabel("Chọn model hình phạt").selectOption("9");
  await expect(
    page.getByRole("heading", { name: "Vạc dầu sôi", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath("oil-cauldron-v2.png"),
    fullPage: true,
  });
  await page.getByLabel("Chọn model hình phạt").selectOption("15");
  await expect(
    page.getByRole("heading", { name: "Phanh thây / xẻ thịt", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Luân hồi · Lục đạo" }).click();
  await expect(page.locator(".realm-options button")).toHaveCount(6);
  await page.getByRole("button", { name: "Ngạ quỷ", exact: true }).click();
  await expect(page.locator(".realm-description")).toContainText("Cõi quỷ đói");
  await page.screenshot({
    path: test.info().outputPath("rebirth-v2.png"),
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Tàng thư", exact: true }).click();
  await page.getByLabel("Chọn tầng đọc điển tích").selectOption("18");
  await expect(
    page.locator('.lore-model-scene [data-punishment="18"]'),
  ).toHaveCount(1);
  await page.keyboard.press("Escape");
  const phone = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await phone.goto("http://localhost:3001");
  expect(
    await phone.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await phone
    .getByRole("button", { name: "Đồ giám nhân vật và hình phạt" })
    .click();
  await expect(
    phone.getByRole("heading", { name: "Ngưu Đầu", exact: true }),
  ).toBeVisible();
  expect(
    await phone
      .locator(".modal")
      .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  ).toBeTruthy();
  await phone.screenshot({
    path: test.info().outputPath("models-mobile-v2.png"),
    fullPage: true,
  });
  await page.goto("http://localhost:3001/models/index.html");
  await expect(page.locator("[data-model]")).toHaveCount(19);
  await page.getByRole("button", { name: "Làm việc", exact: true }).click();
  await expect(page.locator('[data-model="nguu-dau"]')).toHaveAttribute(
    "src",
    "characters/nguu-dau-work.svg",
  );
  // Decode every exported asset, including all character poses, in the browser.
  await page.evaluate(async () => {
    const images = [...document.images];
    await Promise.all(images.map((img) => img.decode()));
    const ids = [...document.querySelectorAll("[data-model]")].map(
      (img) => img.dataset.model,
    );
    for (const pose of ["", "-work", "-surprised"])
      await Promise.all(
        ids.map(async (id) => {
          const image = new Image();
          image.src = `/models/characters/${id}${pose}.svg`;
          await image.decode();
          if (!image.naturalWidth)
            throw new Error(`Broken model: ${id}${pose}`);
        }),
      );
  });
  await page.setViewportSize({ width: 1200, height: 1000 });
  await page.goto("http://localhost:3001/models/characters-sheet.svg");
  await page.screenshot({
    path: test.info().outputPath("characters-sheet-v2.png"),
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://localhost:3001/models/punishments-sheet.svg");
  await page.screenshot({
    path: test.info().outputPath("punishments-sheet-v2.png"),
  });
  expect(errors).toEqual([]);
  await page.close();
  await phone.close();
});
