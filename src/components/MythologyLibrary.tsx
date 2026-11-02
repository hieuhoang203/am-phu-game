import React, { useState } from "react";
import {
  characters,
  punishments,
  realms,
  rebirthSteps,
} from "../../shared/mythology";
import { floors } from "../../shared/world";
import { CharacterSprite, type SpritePose } from "./CharacterSprite";
import { PunishmentStage } from "./PunishmentStage";
export function RebirthPanel({
  canRebirth = false,
  onRebirth,
  cycles = 0,
}: {
  canRebirth?: boolean;
  onRebirth?: () => void;
  cycles?: number;
}) {
  const [realm, setRealm] = useState("human");
  const selected = realms.find((r) => r.id === realm)!;
  return (
    <div className="rebirth-panel">
      <div className="rebirth-visual">
        <svg
          viewBox="0 0 600 320"
          role="img"
          aria-label="Chuyển Luân Vương, Mạnh Bà và bánh xe lục đạo"
        >
          <defs>
            <radialGradient id="rebirth-halo">
              <stop stopColor="#a6b89b" stopOpacity=".2" />
              <stop offset="1" stopColor="#a6b89b" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse
            cx="300"
            cy="160"
            rx="200"
            ry="140"
            fill="url(#rebirth-halo)"
          />
          <g className="rebirth-wheel" transform="translate(300 148)">
            <circle r="113" fill="#223330" stroke="#ad9361" strokeWidth="4" />
            <circle r="100" fill="none" stroke="#8e8964" strokeWidth="1" />
            {realms.map((r, i) => {
              const angle = ((i * 60 - 90) * Math.PI) / 180;
              const next = angle + Math.PI / 3;
              return (
                <g key={r.id}>
                  <path
                    d={`M0 0L${109 * Math.cos(angle - Math.PI / 6)} ${109 * Math.sin(angle - Math.PI / 6)}`}
                    stroke="#8a8967"
                    opacity=".5"
                  />
                  <circle
                    cx={75 * Math.cos(angle)}
                    cy={75 * Math.sin(angle)}
                    r="22"
                    fill={r.color}
                    fillOpacity={realm === r.id ? ".35" : ".1"}
                    stroke={r.color}
                  />
                  <text
                    x={75 * Math.cos(angle)}
                    y={75 * Math.sin(angle) + 6}
                    fontSize="9"
                    textAnchor="middle"
                    fill={r.color}
                  >
                    {r.name}
                  </text>
                </g>
              );
            })}
            <circle r="35" fill="#c1a875" stroke="#e0c78d" strokeWidth="2" />
            <text textAnchor="middle" fill="#314437" fontSize="13">
              <tspan x="0" y="-3">
                LUÂN
              </tspan>
              <tspan x="0" y="15">
                HỒI
              </tspan>
            </text>
          </g>
          <path
            d="M42 291Q300 243 558 291"
            fill="none"
            stroke="#657d6c"
            strokeWidth="7"
          />
          <CharacterSprite id="king-10" x={100} y={289} scale={1.2} />
          <CharacterSprite id="manh-ba" x={500} y={289} scale={1.2} />
          <text
            x="100"
            y="312"
            fill="#c8b487"
            fontSize="12"
            textAnchor="middle"
          >
            CHUYỂN LUÂN VƯƠNG
          </text>
          <text
            x="500"
            y="312"
            fill="#c8b487"
            fontSize="12"
            textAnchor="middle"
          >
            MẠNH BÀ
          </text>
        </svg>
      </div>
      <div className="realm-options" aria-label="Khám phá lục đạo">
        {realms.map((r) => (
          <button
            key={r.id}
            className={realm === r.id ? "selected" : ""}
            onClick={() => setRealm(r.id)}
          >
            {r.name}
          </button>
        ))}
      </div>
      <p className="realm-description">
        <b>{selected.name}:</b> {selected.meaning}
      </p>
      <ol className="rebirth-steps">
        {rebirthSteps.map((s, i) => (
          <li key={s.title}>
            <span>{i + 1}</span>
            <div>
              <b>{s.title}</b>
              <small>{s.detail}</small>
            </div>
          </li>
        ))}
      </ol>
      {onRebirth && (
        <>
          <button
            className="gold-button"
            disabled={!canRebirth}
            onClick={onRebirth}
          >
            Qua cầu · Mở lượt ngao du mới
          </button>
          <p className="muted">
            {canRebirth
              ? "Trở lại đầu hành trình, giữ nguyên kỷ vật, ngoại hình và các nơi đã khám phá."
              : "Gặp Mạnh Bà ở trạm nghỉ vùng 18 để bắt đầu một vòng ngao du mới."}{" "}
            Đã hoàn tất {cycles} vòng. Lượt chơi mới là cơ chế game; nút xem các
            cõi không quyết định nghiệp hay nơi tái sinh.
          </p>
        </>
      )}
    </div>
  );
}
export function MythologyLibrary({
  initialTab = "characters",
  initialFloor = 1,
  initialCharacter = "nguu-dau",
}: {
  initialTab?: "characters" | "punishments" | "rebirth";
  initialFloor?: number;
  initialCharacter?: string;
}) {
  const [tab, setTab] = useState(initialTab),
    [selectedId, setSelectedId] = useState(initialCharacter),
    [floor, setFloor] = useState(initialFloor),
    [pose, setPose] = useState<SpritePose>("idle"),
    [animate, setAnimate] = useState(true);
  const c = characters.find((c) => c.id === selectedId) || characters[0],
    p = punishments[floor - 1];
  return (
    <div className="mythology-library">
      <span className="section-kicker">ÂM TY ĐỒ GIÁM · MODEL 2D</span>
      <h2>Quỷ cũng có chuyện để kể.</h2>
      <div className="library-tabs" role="tablist" aria-label="Mục đồ giám">
        {(["characters", "punishments", "rebirth"] as const).map((t, i) => (
          <button
            role="tab"
            aria-selected={tab === t}
            key={t}
            onClick={() => setTab(t)}
          >
            {["Nhân vật · 19", "Hình phạt · 18", "Luân hồi · Lục đạo"][i]}
          </button>
        ))}
      </div>
      {tab === "characters" && (
        <>
          <div className="model-detail">
            <div className="model-portrait">
              <svg
                viewBox="0 0 300 260"
                role="img"
                aria-label={`Model ${c.name}`}
              >
                <ellipse
                  cx="150"
                  cy="135"
                  rx="108"
                  ry="100"
                  fill={c.color}
                  opacity=".09"
                />
                <circle
                  cx="150"
                  cy="131"
                  r="105"
                  fill="none"
                  stroke="#7e835b"
                  strokeDasharray="2 8"
                />
                <CharacterSprite
                  model={c}
                  x={150}
                  y={228}
                  scale={1.35}
                  pose={pose}
                  animate={animate}
                />
              </svg>
              <div className="pose-controls">
                {(["idle", "work", "surprised"] as const).map((s, i) => (
                  <button
                    key={s}
                    className={pose === s ? "selected" : ""}
                    onClick={() => setPose(s)}
                  >
                    {["Đứng", "Làm việc", "Ngạc nhiên"][i]}
                  </button>
                ))}
                <button
                  aria-pressed={animate}
                  onClick={() => setAnimate(!animate)}
                >
                  {animate ? "Dừng" : "Chạy"}
                </button>
              </div>
            </div>
            <div>
              <span className="section-kicker">
                NHÂN VẬT ÂM TY
                {c.court ? ` · ĐIỆN ${c.court}` : ""}
              </span>
              <h3>{c.name}</h3>
              <p>{c.role}</p>
              <p>
                <b>Nhận diện:</b> {c.features}
              </p>
              <blockquote>“{c.quip}”</blockquote>
              <small>
                Vai trò: [{c.source}]. Tỷ lệ chibi, biểu cảm và lời thoại là
                sáng tác. Các model Thập điện cùng kiểu áo quan, có số điện và
                màu riêng.
              </small>
              <a
                className="text-button"
                href={`/models/characters/${c.id}.svg`}
                target="_blank"
                rel="noreferrer"
              >
                Mở model SVG gốc ↗
              </a>
            </div>
          </div>
          <div className="character-grid">
            {characters.map((m) => (
              <button
                key={m.id}
                className={selectedId === m.id ? "selected" : ""}
                onClick={() => setSelectedId(m.id)}
              >
                <svg viewBox="0 0 150 165" aria-hidden="true">
                  <CharacterSprite
                    model={m}
                    x={75}
                    y={150}
                    scale={0.9}
                    animate={false}
                  />
                </svg>
                <b>{m.name}</b>
                <small>{m.court ? `Điện ${m.court}` : "Âm ty"}</small>
              </button>
            ))}
          </div>
        </>
      )}
      {tab === "punishments" && (
        <>
          <label className="library-select">
            Chọn tầng để xem cảnh và hình phạt
            <select
              aria-label="Chọn model hình phạt"
              value={floor}
              onChange={(e) => setFloor(Number(e.target.value))}
            >
              {floors.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id}. {f.name} · {punishments[f.id - 1].title}
                </option>
              ))}
            </select>
          </label>
          <div className="model-detail punishment-detail">
            <div
              className="punishment-portrait"
              style={{
                background: `radial-gradient(ellipse at center,${p.palette[0]},transparent)`,
              }}
            >
              <svg
                viewBox="0 0 360 300"
                role="img"
                aria-label={`Cảnh ${p.title}`}
              >
                <PunishmentStage floor={floor} animate={animate} />
              </svg>
              <button
                className="outline-button"
                onClick={() => setAnimate(!animate)}
              >
                {animate ? "Dừng hoạt cảnh" : "Chạy hoạt cảnh"}
              </button>
            </div>
            <div>
              <span className="section-kicker">
                TẦNG {floor} · {floors[floor - 1].name}
              </span>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <p>
                <b>Bối cảnh:</b> {p.setting}.
              </p>
              <p>
                <b>Đạo cụ:</b> {p.props.join(", ")}.
              </p>
              <p>
                <b>Hoạt cảnh:</b> {p.effect}
              </p>
              <p>
                <b>Chủ đề trong dị bản:</b> {floors[floor - 1].traditional}.
              </p>
              <small>
                Hình tượng theo danh sách dân gian [S1, S6]. Chuyển động và bố
                trí là chuyển thể hoạt hình; không mô phỏng vết thương. Nghiệt
                Kính là xét nghiệp; Uổng Tử là giam giữ, không tự đặt thêm hình
                phạt.
              </small>
              <a
                className="text-button"
                href={`/models/punishments/floor-${String(floor).padStart(2, "0")}.svg`}
                target="_blank"
                rel="noreferrer"
              >
                Mở cảnh SVG gốc ↗
              </a>
            </div>
          </div>
          <div className="punishment-thumbnails">
            {punishments.map((q) => (
              <button
                className={q.floor === floor ? "selected" : ""}
                key={q.floor}
                onClick={() => setFloor(q.floor)}
              >
                <img
                  src={`/models/punishments/floor-${String(q.floor).padStart(2, "0")}.svg`}
                  alt=""
                />
                <span>
                  {String(q.floor).padStart(2, "0")} · {q.title}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      {tab === "rebirth" && <RebirthPanel />}
      <p className="library-footnote">
        Bộ model 2D dạng vector có thể sửa từng bộ phận; chưa phải mesh 3D. Tắt
        chuyển động theo cài đặt giảm chuyển động của thiết bị. Nguồn chi tiết
        trong Tàng thư.
      </p>
    </div>
  );
}
