import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mkdirSync, writeFileSync } from "node:fs";
import { floors } from "../shared/world";
import { punishments } from "../shared/mythology";
import { Motif } from "../src/components/Motif";
mkdirSync("public/illustrations", { recursive: true });
mkdirSync("docs", { recursive: true });
for (const f of floors) {
  const svg = renderToStaticMarkup(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      role="img"
      aria-label={`Minh họa sáng tác cho ${f.name}: ${f.motif}`}
    >
      <rect width="400" height="400" fill="#111d1d" />
      <circle cx="200" cy="178" r="114" fill="none" stroke="#7d7452" />
      <circle cx="200" cy="178" r="105" fill="none" stroke="#394c40" />
      <Motif symbol={f.symbol} x={200} y={178} color={f.color} scale={2.2} />
      <text
        x="200"
        y="330"
        textAnchor="middle"
        fill="#c9b784"
        fontFamily="Georgia,serif"
        fontSize="23"
      >
        {String(f.id).padStart(2, "0")} · {f.name}
      </text>
      <text
        x="200"
        y="363"
        textAnchor="middle"
        fill="#819888"
        fontFamily="serif"
        fontSize="17"
      >
        TẦNG {String(f.id).padStart(2, "0")}
      </text>
    </svg>,
  );
  writeFileSync(
    `public/illustrations/floor-${String(f.id).padStart(2, "0")}.svg`,
    svg,
  );
}
const header = `# Danh mục 18 tầng — nội dung và minh họa\n\nNgày biên soạn: 02/11/2026. Đọc cùng [nghiên cứu nguồn](RESEARCH.md).\n\nTên, thứ tự và hình tượng định danh dựa trên S1; diễn giải, thành phần cảnh và câu đố là sáng tác của dự án. Các SVG dưới đây là minh họa gốc, không phải ảnh tư liệu. Mỗi tầng có sân cảnh hình phạt riêng, dùng chung mặt phẳng điều khiển. Model và đạo cụ được vẽ bằng vector, có hoạt cảnh trong game; nhấp sân cảnh để xem mô tả, chưa thao tác riêng từng vật thể.\n\n`;
writeFileSync(
  "docs/FLOORS.md",
  header +
    floors
      .map(
        (f) =>
          `## ${f.id}. ${f.name}\n\n![Minh họa gốc: ${f.motif}](../public/models/punishments/floor-${String(f.id).padStart(2, "0")}.svg)\n\n- Hình tượng định danh: ${f.motif}.\n- Chủ đề trong dị bản tiếng Việt S6: ${f.traditional}. Không phải luật phán xét của game.\n- Ý nghĩa theo dị bản: ${f.meaning}\n- Bài học chuyển thể: ${f.reflection}\n- Cảnh hình phạt: ${punishments[f.id - 1].title}. ${punishments[f.id - 1].description}\n- Thành phần thiết kế: ${f.elements.join(", ")}.\n- Khám phá tự do, tương tác trực tiếp tại địa điểm.\n`,
      )
      .join("\n"),
);
const tiles = floors
  .map(
    (f, i) =>
      `<g transform="translate(${(i % 6) * 200} ${Math.floor(i / 6) * 200})"><image href="../public/illustrations/floor-${String(f.id).padStart(2, "0")}.svg" width="200" height="200"/></g>`,
  )
  .join("");
writeFileSync(
  "docs/illustrations.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">${tiles}</svg>`,
);
console.log("Exported 18 original SVG illustrations and docs/FLOORS.md");
