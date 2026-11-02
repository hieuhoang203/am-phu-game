import { expect } from "@playwright/test";
export const GAME_URL = process.env.GAME_URL || "http://localhost:3001";
export async function enter(
  page,
  name,
  room = "OPEN-" + Date.now(),
  team = "A",
) {
  await page.goto(GAME_URL);
  await page.getByLabel("Tên âm hồn").fill(name);
  await page.getByLabel("Mã phòng").fill(room);
  await page.getByLabel("Hội đồng hành").selectOption(team);
  await page.getByRole("button", { name: "Bắt đầu ngao du" }).click();
  await expect(page.locator(".ow-top-left")).toContainText(name);
  return room;
}
export async function at(page) {
  return page.locator("[data-player]").evaluateAll((nodes) => {
    const n = nodes.find((n) => n.textContent.includes("· bạn"));
    if (!n) return null;
    const v = n
      .getAttribute("transform")
      .match(/translate\(([-\d.]+) ([-\d.]+)\)/);
    return { x: +v[1], y: +v[2], id: n.getAttribute("data-player") };
  });
}
export async function walk(page, x, y) {
  await page.locator(".ow-minimap>svg").evaluate(
    (svg, p) => {
      const r = svg.getBoundingClientRect();
      svg.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          clientX: r.left + (p.x / 2800) * r.width,
          clientY: r.top + (p.y / 1900) * r.height,
          button: 0,
        }),
      );
    },
    { x, y },
  );
  await expect
    .poll(
      async () => {
        const p = await at(page);
        return Math.hypot(p.x - x, p.y - y);
      },
      { timeout: 25000 },
    )
    .toBeLessThan(22);
}
