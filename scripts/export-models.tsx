import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import {
  characters,
  punishments,
  rebirthSteps,
  realms,
} from "../shared/mythology";
import { floors } from "../shared/world";
import {
  CharacterSprite,
  type SpritePose,
} from "../src/components/CharacterSprite";
import { PunishmentStage } from "../src/components/PunishmentStage";
const css = readFileSync("src/mythology.css", "utf8");
for (const dir of [
  "public/models/characters",
  "public/models/punishments",
  "docs/models",
])
  mkdirSync(dir, { recursive: true });
for (const model of characters)
  for (const pose of ["idle", "work", "surprised"] as SpritePose[]) {
    const suffix = pose === "idle" ? "" : `-${pose}`;
    writeFileSync(
      `public/models/characters/${model.id}${suffix}.svg`,
      renderToStaticMarkup(
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 290"
          role="img"
          aria-label={`${model.name}: ${model.features}. Biểu cảm ${pose}.`}
        >
          <title>{`${model.name} · ${pose}`}</title>
          <desc>{model.role} Thiết kế hoạt hình của dự án.</desc>
          <style dangerouslySetInnerHTML={{ __html: css }} />
          <CharacterSprite
            model={model}
            x={150}
            y={250}
            scale={1.4}
            pose={pose}
          />
        </svg>,
      ),
    );
  }
for (const p of punishments)
  writeFileSync(
    `public/models/punishments/floor-${String(p.floor).padStart(2, "0")}.svg`,
    renderToStaticMarkup(
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 360 300"
        role="img"
        aria-label={`${floors[p.floor - 1].name}: ${p.title}`}
      >
        <title>{p.title}</title>
        <desc>
          {p.description} Hoạt cảnh: {p.effect}
        </desc>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <PunishmentStage floor={p.floor} />
      </svg>,
    ),
  );
writeFileSync(
  "public/models/characters-sheet.svg",
  renderToStaticMarkup(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1200"
      height="1000"
      viewBox="0 0 1200 1000"
    >
      <rect width="1200" height="1000" fill="#142523" />
      <text x="40" y="38" fill="#dec48b" fontFamily="serif" fontSize="24">
        ÂM TY ĐỒ GIÁM · 19 NHÂN VẬT
      </text>
      {characters.map((c, i) => (
        <g
          key={c.id}
          transform={`translate(${(i % 5) * 240} ${Math.floor(i / 5) * 236 + 50})`}
        >
          <rect
            x="12"
            y="5"
            width="215"
            height="224"
            rx="8"
            fill="#203630"
            stroke="#607454"
          />
          <CharacterSprite
            model={c}
            x={120}
            y={183}
            scale={1.12}
            animate={false}
          />
          <text
            x="120"
            y="211"
            textAnchor="middle"
            fill="#d8c592"
            fontSize="15"
            fontFamily="serif"
          >
            {c.name}
          </text>
        </g>
      ))}
    </svg>,
  ),
);
writeFileSync(
  "public/models/punishments-sheet.svg",
  renderToStaticMarkup(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1440"
      height="1000"
      viewBox="0 0 1440 1000"
    >
      <rect width="1440" height="1000" fill="#142523" />
      <text x="30" y="36" fill="#dec48b" fontSize="24" fontFamily="serif">
        MƯỜI TÁM TẦNG · CẢNH HÌNH PHẠT
      </text>
      {punishments.map((p, i) => (
        <g
          key={p.floor}
          transform={`translate(${(i % 6) * 240} ${Math.floor(i / 6) * 310 + 55})`}
        >
          <rect
            x="7"
            y="6"
            width="227"
            height="296"
            rx="6"
            fill={p.palette[0]}
            stroke="#66745a"
          />
          <PunishmentStage
            floor={p.floor}
            x={0}
            y={12}
            scale={0.67}
            animate={false}
          />
          <text
            x="120"
            y="245"
            textAnchor="middle"
            fill="#e1d2a7"
            fontSize="16"
            fontFamily="serif"
          >{`${p.floor}. ${floors[p.floor - 1].name}`}</text>
          <text
            x="120"
            y="275"
            textAnchor="middle"
            fill="#b5c2a6"
            fontSize="12"
          >
            {p.title}
          </text>
        </g>
      ))}
    </svg>,
  ),
);
const head = `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Âm ty đồ giám · model 2D</title><style>body{margin:0;padding:36px;background:#101d20;color:#cdd6c4;font:14px/1.8 system-ui}h1,h2{font-family:Georgia,serif;color:#dfc68c}p{max-width:900px}a{color:#c6ba8f}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:15px}.card{background:#1e302e;border:1px solid #4d604a;padding:15px;border-radius:6px}img{width:100%;height:200px}h3{font-size:14px;color:#dbc693;margin:5px 0}small{font-size:11px;color:#92ad9b}nav{display:flex;gap:20px;margin:25px 0}.pose button{background:#344b3b;color:#ded4a8;border:1px solid #83956c;padding:8px;cursor:pointer}.card p{font-size:11px}</style><h1>Âm ty đồ giám</h1><p>19 nhân vật · 18 cảnh hình phạt · model vector 2D có chuyển động. Đây là thiết kế game theo dị bản đã ghi nguồn, không phải bản phục dựng lịch sử. SVG có nền trong suốt; mở từng file để tải và chỉnh sửa.</p><nav><a href="#characters">Nhân vật</a><a href="#punishments">Hình phạt</a><a href="/">Về game</a></nav><div class="pose"><button data-pose="">Đứng</button> <button data-pose="-work">Làm việc</button> <button data-pose="-surprised">Ngạc nhiên</button></div><h2 id="characters">Nhân vật</h2><section>`;
const cards = characters
  .map(
    (c) =>
      `<article class="card"><a href="characters/${c.id}.svg"><img data-model="${c.id}" src="characters/${c.id}.svg" alt="${c.name}"></a><h3>${c.name}</h3><small>${c.court ? `Điện ${c.court}` : "Nhân vật âm ty"}</small><p>${c.role}</p></article>`,
  )
  .join("");
const stages = punishments
  .map(
    (p) =>
      `<article class="card"><a href="punishments/floor-${String(p.floor).padStart(2, "0")}.svg"><img src="punishments/floor-${String(p.floor).padStart(2, "0")}.svg" alt="${p.title}"></a><h3>${p.floor}. ${floors[p.floor - 1].name}</h3><small>${p.title}</small><p>${p.description}</p></article>`,
  )
  .join("");
writeFileSync(
  "public/models/index.html",
  head +
    cards +
    `</section><h2 id="punishments">18 hình phạt / cảnh xét nghiệp</h2><section>` +
    stages +
    `</section><script>document.querySelectorAll('[data-pose]').forEach(button=>button.onclick=()=>document.querySelectorAll('[data-model]').forEach(img=>{img.src='characters/'+img.dataset.model+button.dataset.pose+'.svg';img.parentElement.href=img.src;}));</script></html>`,
);
const modelRows = characters
  .map(
    (c) =>
      `| [${c.name}](../../public/models/characters/${c.id}.svg) | ${c.role} | ${c.features} | ${c.source} |`,
  )
  .join("\n");
writeFileSync(
  "docs/models/CHARACTERS.md",
  `# Bộ model nhân vật 2D\n\nCó ${characters.length} model, mỗi model có ba trạng thái đứng, làm việc, ngạc nhiên; xuất 57 SVG có nền trong suốt. Dùng rig đầu / thân / mắt / tay / đạo cụ riêng trong CharacterSprite.tsx. Hoạt hình dựa trên CSS, không phải sprite atlas ảnh hoặc mesh 3D.\n\n| Nhân vật | Vai trò | Nhận diện | Nguồn vai trò |\n| --- | --- | --- | --- |\n${modelRows}\n\nNguồn dẫn trong [RESEARCH.md](../RESEARCH.md). Pháp khí, tỉ lệ và cách biểu đạt được cách điệu. Model vua phân biệt bằng màu áo, số điện và nhãn tên; đây không phải mười bộ phục sức có chứng cứ khảo cổ riêng. Địa Tạng được tạo hình điềm đạm; các cảnh Uổng Tử tập trung tưởng niệm.\n\nBộ gốc: public/models/characters. Các tệp -work.svg và -surprised.svg đi kèm từng tên.\n`,
);
writeFileSync(
  "docs/models/PUNISHMENTS.md",
  `# 18 model cảnh hình phạt\n\nThứ tự theo S1. Tên hình tượng đối chiếu S6. Không đồng nhất 18 cảnh với mười điện xét xử; tầng 4 là gương xét nghiệp, tầng 14 là giam tại thành.\n\n` +
    punishments
      .map(
        (p) =>
          `## ${p.floor}. ${floors[p.floor - 1].name}: ${p.title}\n\n![Model](../../public/models/punishments/floor-${String(p.floor).padStart(2, "0")}.svg)\n\n- Cảnh truyền thuyết: ${p.description}\n- Đạo cụ: ${p.props.join(", ")}.\n- Chuyển thể chuyển động: ${p.effect}\n- Phối cảnh game: ${p.setting}.\n`,
      )
      .join("\n"),
);
writeFileSync(
  "docs/models/REBIRTH.md",
  `# Luân hồi trong giao diện\n\n` +
    rebirthSteps
      .map((s, i) => `${i + 1}. **${s.title}:** ${s.detail}`)
      .join("\n") +
    `\n\nCác cõi: ${realms.map((r) => r.name).join(", ")}.\n\nTự do ngao du giữa 18 vùng và bắt đầu lại là cơ chế game. Nút xem từng cõi chỉ mở chú giải, không chọn nghiệp hay kết quả tái sinh. Gặp Mạnh Bà tại trạm nghỉ vùng 18 để trở lại đầu hành trình. Ngoại hình, đốm hồn và các nơi đã khám phá được giữ lại, số vòng ngao du tăng và được lưu. Nguồn: S1, S3, S8, S9, S11.\n`,
);
console.log(
  `Exported ${characters.length * 3} character SVGs, ${punishments.length} punishment SVGs, gallery and design documents.`,
);
