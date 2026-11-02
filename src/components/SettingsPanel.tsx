import React, { useState } from "react";
import {
  Volume2,
  VolumeX,
  Sparkles,
  Monitor,
  Keyboard,
  Check,
  RotateCcw,
  Play,
  SlidersHorizontal,
} from "lucide-react";
import {
  soulPalettes,
  appearanceOptions,
  type SoulAppearance,
} from "../../shared/customization";
import { defaultSettings, type GameSettings } from "../settings";
import { CharacterSprite } from "./CharacterSprite";
import { prankRules } from "../../shared/mischief";
function Toggle({
  label,
  detail,
  value,
  onChange,
}: {
  label: string;
  detail: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="setting-toggle">
      <span>
        <b>{label}</b>
        <small>{detail}</small>
      </span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
      />
      <i aria-hidden="true" />
    </label>
  );
}
export function SettingsPanel({
  settings,
  onChange,
  onAudioGesture,
  onTestSound,
  saved,
  appearanceStatus,
  joined,
  onClose,
}: {
  settings: GameSettings;
  onChange: (s: GameSettings) => void;
  onAudioGesture: () => void;
  onTestSound: () => void;
  saved: boolean;
  appearanceStatus: string;
  joined: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<
    "audio" | "appearance" | "display" | "controls"
  >("audio");
  const audio = (next: Partial<GameSettings["audio"]>) => {
    onAudioGesture();
    onChange({ ...settings, audio: { ...settings.audio, ...next } });
  };
  const display = (next: Partial<GameSettings["display"]>) =>
    onChange({ ...settings, display: { ...settings.display, ...next } });
  const appearance = (next: Partial<SoulAppearance>) =>
    onChange({ ...settings, appearance: { ...settings.appearance, ...next } });
  const tabs = [
    {
      id: "audio" as const,
      label: "Âm thanh",
      sub: "Âm lượng & hiệu ứng",
      icon: Volume2,
    },
    {
      id: "appearance" as const,
      label: "Ngoại hình",
      sub: "Dấu ấn của vong hồn",
      icon: Sparkles,
    },
    {
      id: "display" as const,
      label: "Hiển thị",
      sub: "Thoải mái khi ngao du",
      icon: Monitor,
    },
    {
      id: "controls" as const,
      label: "Điều khiển",
      sub: "Phím tắt & thao tác",
      icon: Keyboard,
    },
  ];
  return (
    <div className="settings-panel">
      <div className="settings-title">
        <div>
          <span className="section-kicker">TÙY CHỈNH HÀNH TRÌNH</span>
          <h2>Cài đặt</h2>
          <p>Một chút điều chỉnh. Một chuyến đi vừa ý.</p>
        </div>
        <span className={`settings-save ${saved ? "saved" : ""}`} role="status">
          <Check size={13} />
          {saved ? "Đã lưu trên thiết bị" : "Chưa lưu được trên thiết bị"}
        </span>
      </div>
      <div className="settings-layout">
        <aside className="settings-nav" aria-label="Danh mục cài đặt">
          {tabs.map(({ id, label, sub, icon: Icon }) => (
            <button
              key={id}
              aria-label={label}
              aria-pressed={tab === id}
              onClick={() => setTab(id)}
            >
              <Icon size={19} />
              <span>
                {label}
                <small>{sub}</small>
              </span>
            </button>
          ))}
          <div className="settings-local-note">
            <SlidersHorizontal size={18} />
            <p>
              Cài đặt áp dụng ngay. Ngoại hình được chia sẻ khi bạn ở trong
              phòng.
            </p>
          </div>
        </aside>
        <div className="settings-content">
          {tab === "audio" && (
            <>
              <div className="setting-section-heading">
                <span>01 / KHÔNG GIAN ÂM THANH</span>
                <h3>Nghe âm giới theo cách của bạn.</h3>
                <p>Điều chỉnh riêng âm nền và âm tương tác.</p>
              </div>
              <div
                className={`audio-state-card ${settings.audio.muted ? "is-muted" : ""}`}
              >
                <div className="audio-state-icon">
                  {settings.audio.muted ? (
                    <VolumeX size={24} />
                  ) : (
                    <Volume2 size={24} />
                  )}
                </div>
                <div>
                  <b>
                    {settings.audio.muted
                      ? "Âm thanh đang tắt"
                      : "Âm thanh đang bật"}
                  </b>
                  <small>
                    {settings.audio.muted
                      ? "Bật âm để nghe các mức âm lượng bên dưới."
                      : "Âm nền và hiệu ứng đi qua âm lượng tổng."}
                  </small>
                </div>
                <button
                  className="setting-small-button"
                  onClick={() => audio({ muted: !settings.audio.muted })}
                >
                  {settings.audio.muted ? "Bật âm thanh" : "Tắt âm thanh"}
                </button>
              </div>
              <div className="volume-sliders">
                {(
                  [
                    {
                      key: "master",
                      label: "Âm lượng tổng",
                      detail: "Toàn bộ âm thanh của trò chơi",
                    },
                    {
                      key: "music",
                      label: "Âm nền",
                      detail: "Không khí trầm nhẹ của âm giới",
                    },
                    {
                      key: "effects",
                      label: "Hiệu ứng tương tác",
                      detail: "Gõ đầu, đẩy ngã, giải cứu và thông báo",
                    },
                  ] as const
                ).map(({ key, label, detail }) => (
                  <div className="volume-setting" key={key}>
                    <label htmlFor={`volume-${key}`}>
                      <span>
                        <b>{label}</b>
                        <small>{detail}</small>
                      </span>
                      <output>
                        {settings.audio[key]}
                        <small>%</small>
                      </output>
                    </label>
                    <input
                      id={`volume-${key}`}
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={settings.audio[key]}
                      onChange={(e) => audio({ [key]: Number(e.target.value) })}
                      style={
                        {
                          "--range-fill": `${settings.audio[key]}%`,
                        } as React.CSSProperties
                      }
                    />
                    <span className="range-endpoints">
                      <span>0</span>
                      <span>100</span>
                    </span>
                  </div>
                ))}
              </div>
              <Toggle
                label="Tắt tiếng khi rời cửa sổ"
                detail="Tạm ngắt âm khi chuyển thẻ hoặc sang ứng dụng khác."
                value={settings.audio.muteWhenHidden}
                onChange={(v) => audio({ muteWhenHidden: v })}
              />
              <button
                className="setting-test-button"
                disabled={
                  settings.audio.muted ||
                  settings.audio.master === 0 ||
                  settings.audio.effects === 0
                }
                onClick={onTestSound}
              >
                <Play size={14} /> Nghe thử hiệu ứng
              </button>
            </>
          )}
          {tab === "appearance" && (
            <>
              <div className="setting-section-heading">
                <span>02 / NGOẠI HÌNH ÂM HỒN</span>
                <h3>Vong hồn này có gu riêng.</h3>
                <p>Phối màu, biểu cảm, phụ kiện và hào quang.</p>
              </div>
              <div className="appearance-workbench">
                <div className="appearance-preview">
                  <span className="preview-tag">XEM TRƯỚC TRỰC TIẾP</span>
                  <svg
                    viewBox="0 0 280 280"
                    role="img"
                    aria-label="Xem trước ngoại hình vong hồn"
                  >
                    <defs>
                      <radialGradient id="look-preview-light">
                        <stop
                          stopColor={
                            soulPalettes[settings.appearance.palette].body
                          }
                          stopOpacity=".2"
                        />
                        <stop offset="1" stopColor="#182a27" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <circle
                      cx="140"
                      cy="145"
                      r="116"
                      fill="url(#look-preview-light)"
                    />
                    <ellipse
                      cx="140"
                      cy="241"
                      rx="84"
                      ry="20"
                      fill="none"
                      stroke="#8b99706b"
                    />
                    <CharacterSprite
                      id="vong-hon"
                      appearance={settings.appearance}
                      x={140}
                      y={238}
                      scale={1.25}
                      animate={!settings.display.reduceMotion}
                    />
                  </svg>
                  <b>Âm hồn của bạn</b>
                  <small>
                    {soulPalettes[settings.appearance.palette].name} ·{" "}
                    {appearanceOptions.eyes[settings.appearance.eyes]}
                  </small>
                  <span className="appearance-sync" role="status">
                    {joined
                      ? appearanceStatus
                      : "Áp dụng cho nhân vật khi vào phòng"}
                  </span>
                </div>
                <div className="appearance-options">
                  <fieldset>
                    <legend>Màu âm hồn</legend>
                    <div className="palette-options">
                      {Object.entries(soulPalettes).map(([id, p]) => (
                        <button
                          key={id}
                          aria-label={p.name}
                          aria-pressed={settings.appearance.palette === id}
                          onClick={() =>
                            appearance({
                              palette: id as SoulAppearance["palette"],
                            })
                          }
                          style={{ "--swatch": p.body } as React.CSSProperties}
                        >
                          <span>
                            {settings.appearance.palette === id && (
                              <Check size={14} />
                            )}
                          </span>
                          <small>{p.name}</small>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  {(["eyes", "hat", "aura"] as const).map((key, i) => (
                    <fieldset key={key}>
                      <legend>
                        {["Biểu cảm", "Phụ kiện", "Hào quang"][i]}
                      </legend>
                      <div className="appearance-choices">
                        {Object.entries(appearanceOptions[key]).map(
                          ([id, label]) => (
                            <button
                              key={id}
                              aria-pressed={settings.appearance[key] === id}
                              onClick={() => appearance({ [key]: id })}
                            >
                              {label}
                              {settings.appearance[key] === id && (
                                <Check size={12} />
                              )}
                            </button>
                          ),
                        )}
                      </div>
                    </fieldset>
                  ))}
                </div>
              </div>
              <div className="setting-info">
                <Sparkles size={17} />
                <p>
                  Người cùng phòng sẽ thấy diện mạo mới của bạn. Màu phe và
                  trạng thái khống chế vẫn có dấu riêng để dễ nhận diện.
                </p>
              </div>
            </>
          )}
          {tab === "display" && (
            <>
              <div className="setting-section-heading">
                <span>03 / HIỂN THỊ</span>
                <h3>Dễ nhìn, dễ theo dõi.</h3>
                <p>Điều chỉnh giao diện theo thiết bị và thói quen của bạn.</p>
              </div>
              <Toggle
                label="Hạt sáng trong cảnh"
                detail="Hiện đom đóm và các hạt trang trí của hào quang."
                value={settings.display.particles}
                onChange={(v) => display({ particles: v })}
              />
              <Toggle
                label="Giảm chuyển động"
                detail="Dừng hoạt cảnh lặp và chuyển động trang trí. Hành động trong game vẫn cập nhật."
                value={settings.display.reduceMotion}
                onChange={(v) => display({ reduceMotion: v })}
              />
              <Toggle
                label="Hiện tên vong trên bản đồ"
                detail="Tên và trạng thái trong bảng mục tiêu luôn có thể xem."
                value={settings.display.showNames}
                onChange={(v) => display({ showNames: v })}
              />
              <Toggle
                label="Tương phản cao"
                detail="Làm rõ chữ, đường viền và nút bấm."
                value={settings.display.highContrast}
                onChange={(v) => display({ highContrast: v })}
              />
              <Toggle
                label="Nút thao tác lớn"
                detail="Tăng vùng chạm cho các chiêu và nút điều hướng."
                value={settings.display.largeButtons}
                onChange={(v) => display({ largeButtons: v })}
              />
              <Toggle
                label="Hiện gợi ý phím tắt"
                detail="Hiện nhãn phím ngay trên các nút chiêu."
                value={settings.display.showKeys}
                onChange={(v) => display({ showKeys: v })}
              />
            </>
          )}
          {tab === "controls" && (
            <>
              <div className="setting-section-heading">
                <span>04 / ĐIỀU KHIỂN</span>
                <h3>Nắm phím. Quậy đúng lúc.</h3>
                <p>Chọn một vong trước khi dùng chiêu cần mục tiêu.</p>
              </div>
              <div className="control-reference">
                <div>
                  <span>Di chuyển</span>
                  <span>
                    <kbd>W</kbd>
                    <kbd>A</kbd>
                    <kbd>S</kbd>
                    <kbd>D</kbd> / phím mũi tên
                  </span>
                </div>
                <div>
                  <span>Rương / di tích / cư dân / cổng</span>
                  <kbd>E</kbd>
                </div>
                {Object.entries(prankRules)
                  .filter(([key]) => key !== "release")
                  .map(([key, r]) => (
                    <div key={key}>
                      <span>{r.label}</span>
                      <kbd>{r.key}</kbd>
                    </div>
                  ))}
              </div>
              <div className="setting-info">
                <Keyboard size={19} />
                <p>
                  Trên điện thoại, chạm nơi muốn đến hoặc dùng “Đến gần mục
                  tiêu”. Khi đang kéo, chọn “Đưa tới vòng ném”. Toàn bộ chiêu
                  đều có nút cảm ứng.
                </p>
              </div>
              <p className="setting-footnote">
                Các phím tắt hiện dùng bố cục cố định. Tổ hợp Ctrl / Cmd / Alt
                của trình duyệt được giữ nguyên.
              </p>
            </>
          )}
        </div>
      </div>
      <div className="settings-footer">
        <span>Thay đổi được lưu tự động trên trình duyệt này.</span>
        <div className="settings-footer-actions">
          <button
            className="setting-reset-button"
            onClick={() => {
              onAudioGesture();
              onChange(structuredClone(defaultSettings));
            }}
          >
            <RotateCcw size={14} /> Khôi phục mặc định
          </button>
          <button className="gold-button settings-done" onClick={onClose}>
            Xong <Check size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
