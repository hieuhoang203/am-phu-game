import { test, expect } from "@playwright/test";
test("desktop and mobile journey, two browser clients, no script injection", async ({
  browser,
}) => {
  const one = await browser.newContext({
    viewport: { width: 1440, height: 1080 },
  });
  const two = await browser.newContext({
    viewport: { width: 1440, height: 1080 },
  });
  const a = await one.newPage(),
    b = await two.newPage();
  const errors = [];
  a.on("pageerror", (e) => errors.push(e.message));
  b.on("pageerror", (e) => errors.push(e.message));
  await a.goto("http://localhost:3001");
  await expect(
    a.getByRole("heading", { name: "Bạt Thiệt Địa Ngục 拔舌" }),
  ).toBeVisible();
  await a.screenshot({
    path: test.info().outputPath("desktop.png"),
    fullPage: true,
  });
  const enter = async (page, name) => {
    await page.goto("http://localhost:3001");
    await page.getByRole("button", { name: "Bắt đầu ngao du" }).click();
    await page.getByLabel("Tên lữ khách").fill(name);
    await page.getByLabel("Mã phòng đồng hành").fill("BROWSER-QA");
    await page.getByRole("button", { name: "Bước vào âm giới" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  };
  await enter(a, "Mộc Miên");
  await enter(b, "Thanh Vân");
  await expect(a.getByText("2 linh hồn tại tầng này")).toBeVisible();
  await a.getByLabel("Tin nhắn đồng hành").fill("<img src=x onerror=alert(1)>");
  await a.getByRole("button", { name: "Gửi tin nhắn", exact: true }).click();
  await expect(
    b.getByText("<img src=x onerror=alert(1)>", { exact: true }),
  ).toBeVisible();
  expect(await b.locator(".chat-messages img").count()).toBe(0);
  await a.getByRole("button", { name: "Thắp đèn bên tả" }).click();
  await b.getByRole("button", { name: "Thắp đèn bên hữu" }).click();
  await expect(a.getByText("Đã thắp sáng", { exact: true })).toHaveCount(2, {
    timeout: 15000,
  });
  await a.getByRole("button", { name: "Đối thoại với Dẫn hồn sứ" }).click();
  await expect(a.getByRole("dialog")).toBeVisible({ timeout: 15000 });
  await a.getByRole("button", { name: "A Kiểm chứng trước khi kể" }).click();
  await expect(a.getByText("Ấn ký đã được trao.")).toBeVisible();
  await a.getByRole("button", { name: "Đi đến cổng" }).click();
  await expect(
    a.getByRole("heading", { name: "Tiễn Đao Địa Ngục 剪刀" }),
  ).toBeVisible({ timeout: 15000 });
  await a.reload();
  await a.getByRole("button", { name: "Bắt đầu ngao du" }).click();
  await a.getByRole("button", { name: "Bước vào âm giới" }).click();
  await expect(a.locator(".sidebar-footer b")).toHaveText("1/18");
  await a.getByRole("button", { name: "Tàng thư", exact: true }).click();
  await a.getByLabel("Chọn tầng đọc điển tích").selectOption("18");
  await expect(
    a.getByRole("heading", { name: "Đao Cưa · 刀锯" }),
  ).toBeVisible();
  await a.getByRole("button", { name: "Đóng hộp thoại" }).click();
  await a.screenshot({
    path: test.info().outputPath("multiplayer.png"),
    fullPage: true,
  });
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const phone = await mobile.newPage();
  await phone.goto("http://localhost:3001");
  expect(
    await phone.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await phone.screenshot({
    path: test.info().outputPath("mobile.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
  await one.close();
  await two.close();
  await mobile.close();
});
