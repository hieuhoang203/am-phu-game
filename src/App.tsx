import React, { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  BookOpen,
  Map,
  Users,
  Flame,
  ChevronDown,
  ChevronRight,
  ArrowDown,
  Send,
  Volume2,
  VolumeX,
  X,
  Check,
  Lock,
  Compass,
  Footprints,
  ScrollText,
  ExternalLink,
  Copy,
  LogOut,
  Maximize2,
  Settings2,
} from "lucide-react";
import {
  floors,
  sources,
  WORLD,
  type Floor,
  type Player,
  type Snapshot,
} from "../shared/world";

import { Motif } from "./components/Motif";
import { Scene } from "./components/Scene";
import { MythologyLibrary, RebirthPanel } from "./components/MythologyLibrary";
import { PunishmentStage } from "./components/PunishmentStage";
import { punishments } from "../shared/mythology";
import "./mythology.css";
import "./mischief.css";
import "./interface.css";
import { SettingsPanel } from "./components/SettingsPanel";
import { CharacterSprite } from "./components/CharacterSprite";
import {
  readSettings,
  normalizeSettings,
  SETTINGS_KEY,
  type GameSettings,
} from "./settings";
import { GameAudio, type SoundCue } from "./audio";
import { MischiefPanel } from "./components/MischiefPanel";
import {
  movementFactor,
  type PrankAction,
  type Team,
} from "../shared/mischief";
export default function App() {
  const [settings, setSettings] = useState(readSettings),
    [settingsSaved, setSettingsSaved] = useState(true),
    [appearanceStatus, setAppearanceStatus] = useState("Đã đồng bộ");
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const [world, setWorld] = useState<Snapshot>({
    players: [],
    lanterns: [false, false],
    chat: [],
  });
  const [me, setMe] = useState<Player>();
  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [team, setTeam] = useState<"auto" | Team>(
    (sessionStorage.getItem("ap-team") as Team) || "auto",
  );
  const [targetId, setTargetId] = useState("");
  const mischiefRef = useRef<(action: PrankAction) => void>(() => {}),
    clockOffset = useRef(0);
  mischiefRef.current = (action) => {
    if (!socket.current?.connected || !meRef.current) {
      setNotice("Hãy vào phòng để quậy cùng bạn bè.");
      return;
    }
    socket.current.emit("mischief", { action, targetId });
  };
  const [name, setName] = useState(sessionStorage.getItem("ap-name") || "");
  const [room, setRoom] = useState(
    new URLSearchParams(location.search).get("room") ||
      sessionStorage.getItem("ap-room") ||
      "VONG-XUYEN",
  );
  const [modal, setModal] = useState<
    "join" | "lore" | "quiz" | "help" | "finish" | "models" | "settings" | null
  >(null);
  const [loreFloor, setLoreFloor] = useState(1);
  const [libraryTab, setLibraryTab] = useState<
    "characters" | "punishments" | "rebirth"
  >("characters");
  const [libraryCharacter, setLibraryCharacter] = useState("nguu-dau");
  const inspect = (
    target: "characters" | "punishments" | "rebirth",
    character = "nguu-dau",
  ) => {
    setLibraryTab(target);
    setLibraryCharacter(character);
    setModal("models");
  };
  const [notice, setNotice] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"quest" | "lore">("quest");
  const muted = settings.audio.muted;
  const [expanded, setExpanded] = useState(false);
  const socket = useRef<Socket | null>(null),
    meRef = useRef<Player | undefined>(undefined),
    destination = useRef<{ x: number; y: number; action?: string } | null>(
      null,
    ),
    keys = useRef(new Set<string>()),
    joinRef = useRef(false),
    audioRef = useRef<GameAudio | null>(null),
    chatEnd = useRef<HTMLDivElement>(null);
  if (!audioRef.current) audioRef.current = new GameAudio();
  useEffect(() => {
    audioRef.current?.configure(settings.audio);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setSettingsSaved(true);
    } catch {
      setSettingsSaved(false);
    }
  }, [settings]);
  useEffect(() => {
    const focused = () => audioRef.current?.setFocused(!document.hidden);
    const blurred = () => audioRef.current?.setFocused(false);
    const firstGesture = () => {
      if (!settingsRef.current.audio.muted) void audioRef.current?.unlock();
    };
    document.addEventListener("visibilitychange", focused);
    window.addEventListener("focus", focused);
    window.addEventListener("blur", blurred);
    window.addEventListener("pointerdown", firstGesture, { once: true });
    return () => {
      document.removeEventListener("visibilitychange", focused);
      window.removeEventListener("focus", focused);
      window.removeEventListener("blur", blurred);
      window.removeEventListener("pointerdown", firstGesture);
    };
  }, []);
  const appearanceKey = JSON.stringify(settings.appearance);
  useEffect(() => {
    if (!joined) return;
    if (!connected) {
      setAppearanceStatus("Đang chờ kết nối…");
      return;
    }
    setAppearanceStatus("Đang đồng bộ…");
    const t = setTimeout(
      () => socket.current?.emit("appearance", settingsRef.current.appearance),
      350,
    );
    return () => clearTimeout(t);
  }, [appearanceKey, joined, connected]);
  useEffect(() => {
    if (!modal) return;
    destination.current = null;
    keys.current.clear();
    const previous = document.activeElement as HTMLElement;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const nodes = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input,select,a[href]",
        ) || [],
      );
    (dialog?.querySelector<HTMLElement>("input") || nodes()[0])?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModal(null);
        return;
      }
      if (event.key !== "Tab") return;
      const items = nodes();
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("keydown", keyboard);
      previous?.focus();
    };
  }, [modal]);
  const floor = floors[(me?.floor || 1) - 1];
  const complete = me?.completed.includes(floor.id) || false;
  useEffect(() => {
    const s = io({ autoConnect: true });
    socket.current = s;
    s.on("connect", () => {
      setConnected(true);
      if (joinRef.current)
        s.emit("join", {
          name: sessionStorage.getItem("ap-name"),
          room: sessionStorage.getItem("ap-room"),
          token: sessionStorage.getItem("ap-token"),
          team: sessionStorage.getItem("ap-team"),
          appearance: settingsRef.current.appearance,
        });
    });
    s.on("disconnect", () => {
      setConnected(false);
      destination.current = null;
      setNotice("Mất kết nối. Đang thử kết nối lại…");
    });
    s.on(
      "joined",
      ({
        player,
        token,
        room,
      }: {
        player: Player;
        token: string;
        room: string;
      }) => {
        sessionStorage.setItem("ap-token", token);
        sessionStorage.setItem("ap-name", player.name);
        sessionStorage.setItem("ap-room", room);
        sessionStorage.setItem("ap-team", player.team || "A");
        setTeam(player.team || "A");
        setMe(player);
        meRef.current = player;
        setJoined(true);
        joinRef.current = true;
        setModal(null);
        setNotice("Đã vào phòng. Nhấp lên đường đá để di chuyển.");
      },
    );
    s.on("world", (w: Snapshot) => {
      if (w.social) clockOffset.current = w.social.serverTime - Date.now();
      setWorld(w);
      const p = w.players.find((p) => p.id === s.id);
      if (p) {
        if (meRef.current?.floor !== p.floor) destination.current = null;
        if (p.soul?.state && p.soul.state !== "free") {
          destination.current = null;
          keys.current.clear();
        }
        if (meRef.current?.soul?.state !== p.soul?.state && p.soul) {
          audioRef.current?.play(
            p.soul.state === "free"
              ? "recover"
              : p.soul.state === "stunned"
                ? "bonk"
                : p.soul.state === "punished"
                  ? "throw"
                  : "push",
          );
        }
        meRef.current = p;
        setMe(p);
      }
    });
    s.on("notice", setNotice);
    s.on("appearance-saved", ({ appearance }) => {
      if (
        JSON.stringify(appearance) ===
        JSON.stringify(settingsRef.current.appearance)
      )
        setAppearanceStatus("Đã đồng bộ với phòng");
    });
    s.on("appearance-error", (text: string) => setAppearanceStatus(text));
    s.on(
      "action-result",
      ({ action, ok }: { action: PrankAction; ok: boolean }) => {
        const cues: Partial<Record<PrankAction, SoundCue>> = {
          bonk: "bonk",
          push: "push",
          throw: "throw",
          rescue: "rescue",
          guard: "guard",
          banana: "banana",
        };
        audioRef.current?.play(ok ? cues[action] || "click" : "error");
      },
    );
    s.on("reincarnated", () => {
      setModal(null);
      destination.current = null;
      setNotice("Đã qua cầu luân hồi. Một lượt ngao du mới bắt đầu.");
    });
    return () => {
      s.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 5500);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ block: "nearest" });
  }, [world.chat.length]);
  const performRef = useRef<(action: string) => void>(() => {});
  performRef.current = (action) => {
    if (action.startsWith("lamp"))
      socket.current?.emit("interact", Number(action.slice(-1)));
    if (action === "npc") setModal("quiz");
    if (action === "gate") {
      const p = meRef.current;
      if (!p) return;
      if (p.floor === 18 && p.completed.includes(18)) setModal("finish");
      else if (p.completed.includes(p.floor))
        socket.current?.emit("travel", p.floor + 1);
      else setNotice("Hãy thắp đèn và giải ấn với Dẫn hồn sứ trước.");
    }
  };
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (
        (e.target as HTMLElement)?.closest(
          "input,textarea,select,[contenteditable=true]",
        ) ||
        modal
      )
        return;
      const k = e.key.toLowerCase();
      const shortcuts: Record<string, PrankAction> = {
        f: "push",
        g: "bonk",
        r: meRef.current?.soul?.dragging ? "release" : "drag",
        t: "throw",
        q: "guard",
        c: "rescue",
        v: "banana",
        x: "disarm",
        " ": "struggle",
      };
      if (shortcuts[k]) {
        if (k === " " && (e.target as HTMLElement)?.closest("button")) return;
        e.preventDefault();
        if (!e.repeat) mischiefRef.current(shortcuts[k]);
        return;
      }
      if (
        [
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
          "w",
          "a",
          "s",
          "d",
          "e",
        ].includes(k)
      ) {
        e.preventDefault();
        keys.current.add(k);
      }
      if (k === "e") {
        const p = meRef.current;
        if (!p) return;
        const targets = [
          ...WORLD.lanterns.map((x, i) => ({ ...x, action: `lamp${i}` })),
          { ...WORLD.npc, action: "npc" },
          { ...WORLD.gate, action: "gate" },
        ];
        const t = targets.sort(
          (a, b) =>
            Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y),
        )[0];
        if (Math.hypot(t.x - p.x, t.y - p.y) < 100)
          performRef.current(t.action);
        else setNotice("Đến gần đèn, Dẫn hồn sứ hoặc cổng để tương tác.");
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    const blur = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      keys.current.clear();
    };
  }, [modal]);
  useEffect(() => {
    const timer = setInterval(() => {
      const p = meRef.current;
      if (!p || !socket.current?.connected) return;
      if (p.soul && p.soul.state !== "free") return;
      let dx = 0,
        dy = 0;
      const k = keys.current;
      if (k.has("w") || k.has("arrowup")) dy--;
      if (k.has("s") || k.has("arrowdown")) dy++;
      if (k.has("a") || k.has("arrowleft")) dx--;
      if (k.has("d") || k.has("arrowright")) dx++;
      if (dx || dy) destination.current = null;
      else if (destination.current) {
        dx = destination.current.x - p.x;
        dy = destination.current.y - p.y;
        if (Math.hypot(dx, dy) < 12) {
          const action = destination.current.action;
          destination.current = null;
          if (action) performRef.current(action);
          return;
        }
      }
      const length = Math.hypot(dx, dy);
      if (length) {
        const now = Date.now() + clockOffset.current;
        const speed = WORLD.speed * movementFactor(p.soul, now);
        const step = Math.min(speed * 0.05, length);
        socket.current.emit("move", {
          x: p.x + (dx / length) * step,
          y: p.y + (dy / length) * step,
        });
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);
  useEffect(
    () => () => {
      void audioRef.current?.dispose();
    },
    [],
  );
  const go = (x: number, y: number, action?: string) => {
    if (!me || !connected) {
      setModal("join");
      return;
    }
    destination.current = {
      x: Math.max(160, Math.min(840, x)),
      y: Math.max(150, Math.min(580, y)),
      action,
    };
  };
  const action = (target: string) => {
    const point = target.startsWith("lamp")
      ? WORLD.lanterns[Number(target.slice(-1))]
      : target === "npc"
        ? WORLD.npc
        : WORLD.gate;
    go(point.x, point.y, target);
  };
  const join = (e: React.FormEvent) => {
    e.preventDefault();
    void audioRef.current?.unlock();
    if (!connected) {
      setNotice("Chưa kết nối được máy chủ. Hãy kiểm tra máy chủ đang chạy.");
      return;
    }
    socket.current?.emit("join", {
      name,
      room,
      token: sessionStorage.getItem("ap-token"),
      team,
      appearance: settings.appearance,
    });
  };
  const sound = () => {
    void audioRef.current?.unlock();
    setSettings((current) => ({
      ...current,
      audio: { ...current.audio, muted: !current.audio.muted },
    }));
  };
  const copy = async () => {
    try {
      const url = new URL(location.href);
      url.searchParams.set("room", room);
      await navigator.clipboard.writeText(url.href);
      setNotice("Đã sao chép liên kết phòng. Gửi cho bạn bè cùng tham gia.");
    } catch {
      setNotice(`Mã phòng của bạn: ${room}`);
    }
  };
  return (
    <div
      className={[
        "app-shell",
        "interface-v4",
        settings.display.reduceMotion ? "reduce-motion" : "",
        !settings.display.particles ? "no-particles" : "",
        !settings.display.showNames ? "hide-names" : "",
        settings.display.highContrast ? "high-contrast" : "",
        settings.display.largeButtons ? "large-controls" : "",
        !settings.display.showKeys ? "hide-shortcuts" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header>
        <a className="brand" href="/" aria-label="Âm Phủ Du Ký">
          <span className="brand-seal">冥</span>
          <span>
            ÂM PHỦ <b>DU KÝ</b>
            <small>MƯỜI TÁM TẦNG · MỘT HÀNH TRÌNH</small>
          </span>
        </a>
        <nav>
          <button className="nav-active" onClick={() => setModal(null)}>
            <Compass size={16} /> Khám phá
          </button>
          <button
            onClick={() => {
              setLoreFloor(floor.id);
              setModal("lore");
            }}
          >
            <BookOpen size={16} /> Tàng thư
          </button>
          <button onClick={() => setModal("help")}>
            <ScrollText size={16} /> Cách chơi
          </button>
          <button
            aria-label="Đồ giám nhân vật và hình phạt"
            onClick={() => inspect("characters")}
          >
            <Users size={16} /> Đồ giám
          </button>
          <button
            aria-label="Luân hồi và lục đạo"
            onClick={() => inspect("rebirth")}
          >
            <Compass size={16} /> Luân hồi
          </button>
        </nav>
        <div className="header-right">
          <span className={`connection ${connected ? "live" : ""}`}>
            <i />
            {connected ? "Máy chủ trực tuyến" : "Đang kết nối"}
          </span>
          <button
            className="icon-button"
            onClick={sound}
            aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <span className="avatar">
            <svg viewBox="0 0 70 75" aria-hidden="true">
              <CharacterSprite
                id="vong-hon"
                x={35}
                y={69}
                scale={0.39}
                appearance={settings.appearance}
                animate={false}
              />
            </svg>
          </span>
          <button
            className={`settings-trigger ${modal === "settings" ? "active" : ""}`}
            onClick={() => setModal("settings")}
            aria-label="Cài đặt trò chơi"
            title="Cài đặt trò chơi"
          >
            <Settings2 size={18} />
          </button>
        </div>
      </header>
      <div className="workspace">
        <aside className="sidebar">
          <div className="side-title">
            <Map size={16} />
            <span>ĐỊA ĐỒ ÂM GIỚI</span>
          </div>
          <div className="journey-title">
            Mười tám tầng sâu<small>Mỗi bước đi, một điều thấu hiểu.</small>
          </div>
          <div className="floor-list">
            {floors.map((f) => (
              <button
                key={f.id}
                className={`floor-item ${floor.id === f.id ? "selected" : ""} ${me?.completed.includes(f.id) ? "done" : ""}`}
                onClick={() => {
                  if (f.id === floor.id) {
                    setLoreFloor(f.id);
                    setModal("lore");
                  } else if (me && f.id <= me.maxFloor) {
                    socket.current?.emit("travel", f.id);
                  } else {
                    setLoreFloor(f.id);
                    setModal("lore");
                  }
                }}
              >
                <span className="floor-number">
                  {String(f.id).padStart(2, "0")}
                </span>
                <span>
                  {f.name}
                  <small>{f.han}地獄</small>
                </span>
                {me?.completed.includes(f.id) ? (
                  <Check size={13} />
                ) : f.id === floor.id ? (
                  <span className="active-dot" />
                ) : !me || f.id > me.maxFloor ? (
                  <Lock size={11} />
                ) : (
                  <ChevronRight size={13} />
                )}
              </button>
            ))}
          </div>
          <div className="sidebar-footer">
            <span>
              HÀNH TRÌNH CỦA BẠN <b>{me?.completed.length || 0}/18</b>
            </span>
            <div className="progress-track">
              <i
                style={{
                  width: `${((me?.completed.length || 0) / 18) * 100}%`,
                }}
              />
            </div>
            <small>
              {me?.completed.length === 18
                ? "Đã đi trọn hành trình"
                : "Ánh sáng bắt đầu từ một bước chân."}
            </small>
          </div>
        </aside>
        <main>
          <div className="breadcrumb">
            Âm giới <ChevronRight size={11} /> Mười tám tầng địa ngục{" "}
            <ChevronRight size={11} />
            <span>Tầng {String(floor.id).padStart(2, "0")}</span>
          </div>
          <div className="main-title">
            <div>
              <div className="eyebrow">
                <span /> CHƯƠNG {String(floor.id).padStart(2, "0")} · CỬA NGÕ
                NGHIỆP DUYÊN
              </div>
              <h1>
                {floor.name} Địa Ngục <span>{floor.han}</span>
              </h1>
              <p>{floor.subtitle}.</p>
            </div>
            <button className="outline-button invite" onClick={copy}>
              <Users size={15} /> Mời đồng hành <Copy size={13} />
            </button>
          </div>
          <section className="floor-truth">
            <div>
              <b>{punishments[floor.id - 1].title}</b>
              <p>
                {punishments[floor.id - 1].description} ·{" "}
                {punishments[floor.id - 1].setting}
              </p>
            </div>
            <button onClick={() => inspect("punishments")}>
              Xem cảnh & hình phạt ↗
            </button>
          </section>
          <section className={`world-card ${expanded ? "expanded" : ""}`}>
            <div className="world-topbar">
              <span>
                <i className="active-dot" /> {room}
                <ChevronDown size={12} />
              </span>
              <span>
                <Users size={13} />
                {joined ? world.players.length : 0} linh hồn tại tầng này{" "}
                {expanded && (
                  <button
                    className="icon-button"
                    aria-label="Cài đặt khi mở rộng"
                    onClick={() => setModal("settings")}
                  >
                    <Settings2 size={17} />
                  </button>
                )}
                <button
                  className="icon-button"
                  aria-label={expanded ? "Thu gọn bản đồ" : "Mở rộng bản đồ"}
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? <X size={15} /> : <Maximize2 size={15} />}
                </button>
              </span>
            </div>
            <div className="scene-wrap">
              <Scene
                floor={floor}
                players={world.players}
                me={me}
                lamps={world.lanterns}
                onGo={go}
                onAction={action}
                onInspect={(target, character) => {
                  setExpanded(false);
                  inspect(target, character);
                }}
                selectedId={targetId}
                onSelect={setTargetId}
                social={world.social}
              />
              <div className="map-caption">
                <span>境</span>
                <div>
                  {floor.han}地獄
                  <small>TẦNG THỨ {String(floor.id).padStart(2, "0")}</small>
                </div>
              </div>
              <div className="map-label">
                <i />{" "}
                {joined
                  ? "Chọn vong để quậy · vùng nghỉ có vòng xanh"
                  : complete
                    ? "Ấn đã khai mở"
                    : "Vùng khám phá"}
              </div>
              {!joined && (
                <div className="start-card">
                  <div className="eyebrow">MỘT CHUYẾN ĐI VỀ PHÍA SÂU</div>
                  <h2>
                    Người lữ khách,
                    <br />
                    đèn đã chờ bạn.
                  </h2>
                  <p>
                    Bước qua Quỷ Môn Quan, tìm lại những câu chuyện bị lãng quên
                    và gặp người cùng đường.
                  </p>
                  <button
                    className="gold-button"
                    onClick={() => setModal("join")}
                  >
                    Bắt đầu ngao du <ArrowDown size={16} />
                  </button>
                  <small>Miễn phí · Không cần tạo tài khoản</small>
                </div>
              )}
            </div>
            <div className="world-controls">
              <span>
                <kbd>W</kbd>
                <kbd>A</kbd>
                <kbd>S</kbd>
                <kbd>D</kbd> <span>Di chuyển</span>
                <b>·</b>
                <kbd>E</kbd>
                <span>Tương tác</span>
              </span>
              <span className="click-hint">
                <Footprints size={13} /> Hoặc nhấp vào nơi muốn đến
              </span>
            </div>
          </section>
          {me && joined && (
            <MischiefPanel
              me={me}
              world={world}
              targetId={targetId}
              onSelect={setTargetId}
              onAction={(a) => mischiefRef.current(a)}
              onStage={() => go(435, 450)}
              onApproach={(p) => {
                const dx = me.x - p.x,
                  dy = me.y - p.y,
                  d = Math.hypot(dx, dy) || 1;
                go(p.x + (dx / d) * 45, p.y + (dy / d) * 45);
              }}
            />
          )}
          <div className="below-map">
            <div>
              <span className="section-kicker">DẤU CHÂN LỮ KHÁCH</span>
              <h3>Đi chậm một chút. Hiểu sâu hơn.</h3>
              <p>Mỗi ngọn đèn được thắp là một con đường mở ra cho tất cả.</p>
            </div>
            <button
              className="text-button"
              onClick={() => {
                setLoreFloor(floor.id);
                setModal("lore");
              }}
            >
              Chuyện của tầng này <ChevronRight size={15} />
            </button>
          </div>
          <section className="chat-panel">
            <div className="chat-heading">
              <span>
                <Users size={15} /> Tiếng vọng đồng hành{" "}
                <i>{joined ? world.players.length : 0}</i>
              </span>
              <span>PHÒNG {room}</span>
            </div>
            <div className="chat-messages" aria-live="polite">
              {world.chat.length ? (
                world.chat.map((m) => (
                  <div key={m.id} className={m.system ? "system-message" : ""}>
                    <b>{m.name}</b>
                    <span>{m.text}</span>
                  </div>
                ))
              ) : (
                <div className="empty-chat">
                  <Flame size={15} />
                  <span>
                    Chưa có tiếng vọng. Mời một người bạn cùng bước vào âm giới.
                  </span>
                </div>
              )}
              <div ref={chatEnd} />
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!joined) {
                  setModal("join");
                  return;
                }
                if (message.trim()) {
                  socket.current?.emit("chat", message);
                  setMessage("");
                }
              }}
            >
              <input
                aria-label="Tin nhắn đồng hành"
                maxLength={240}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  joined
                    ? "Gửi một lời đến người cùng đường…"
                    : "Bắt đầu hành trình để trò chuyện…"
                }
              />
              <button aria-label="Gửi tin nhắn" type="submit">
                <Send size={16} />
              </button>
            </form>
          </section>
        </main>
        <aside className="right-panel">
          <div className="right-tabs">
            <button
              className={tab === "quest" ? "active" : ""}
              onClick={() => setTab("quest")}
            >
              Hành trình
            </button>
            <button
              className={tab === "lore" ? "active" : ""}
              onClick={() => setTab("lore")}
            >
              Điển tích
            </button>
          </div>
          {tab === "quest" ? (
            <>
              <div className="chapter-card">
                <span className="chapter-mark">{floor.han.charAt(0)}</span>
                <span className="section-kicker">
                  NHIỆM VỤ TẦNG {String(floor.id).padStart(2, "0")}
                </span>
                <h2>
                  Thắp sáng
                  <br />
                  miền quên lãng
                </h2>
                <p>
                  Giữ ngọn đèn của bạn sáng.
                  <br />
                  Và đừng quên người đi cùng.
                </p>
                <span className="quest-tag">
                  <Flame size={11} /> KHÁM PHÁ & ĐỒNG HÀNH
                </span>
              </div>
              <div className="quest-list">
                <button onClick={() => action("lamp0")}>
                  <span
                    className={`quest-check ${world.lanterns[0] ? "checked" : ""}`}
                  >
                    {world.lanterns[0] ? <Check size={12} /> : 1}
                  </span>
                  <span>
                    Thắp đèn bên tả<small>Tìm ngọn đèn phía tây.</small>
                  </span>
                  <ChevronRight size={13} />
                </button>
                <button onClick={() => action("lamp1")}>
                  <span
                    className={`quest-check ${world.lanterns[1] ? "checked" : ""}`}
                  >
                    {world.lanterns[1] ? <Check size={12} /> : 2}
                  </span>
                  <span>
                    Thắp đèn bên hữu
                    <small>Cùng soi lối cho người đến sau.</small>
                  </span>
                  <ChevronRight size={13} />
                </button>
                <button onClick={() => action("npc")}>
                  <span className={`quest-check ${complete ? "checked" : ""}`}>
                    {complete ? <Check size={12} /> : 3}
                  </span>
                  <span>
                    Đối thoại với Dẫn hồn sứ
                    <small>Lắng nghe và giải ấn của tầng.</small>
                  </span>
                  <ChevronRight size={13} />
                </button>
              </div>
              <div className="reward">
                <span>ẤN KÝ THU THẬP</span>
                <div>
                  <span className="seal-small">印</span>
                  <div>
                    Ấn {floor.name}
                    <small>
                      {complete
                        ? "Đã ghi vào hành trình"
                        : "Hoàn thành đối thoại để nhận"}
                    </small>
                  </div>
                </div>
              </div>
              <button
                className={`gate-button ${complete ? "ready" : ""}`}
                onClick={() => action("gate")}
              >
                {complete ? <ArrowDown size={14} /> : <Lock size={13} />}{" "}
                {floor.id === 18 ? "Cổng trở về" : "Xuống tầng tiếp theo"}
                <span>
                  {String(Math.min(18, floor.id + 1)).padStart(2, "0")}
                </span>
              </button>
              <div className="little-note">
                <Flame size={17} />
                <p>
                  Hai ngọn đèn được chia sẻ cho cả phòng. Một người cũng có thể
                  tự hoàn thành.
                </p>
              </div>
            </>
          ) : (
            <div className="lore-preview">
              <span className="section-kicker">HÌNH TƯỢNG DÂN GIAN</span>
              <h2>{floor.motif}</h2>
              <p>{floor.meaning}</p>
              <h4>Thành phần trong cảnh</h4>
              {floor.elements.map((e) => (
                <p key={e}>◇ {e}</p>
              ))}
              <p className="muted">
                Bố cục cảnh, nhân vật dẫn đường và thông điệp nhiệm vụ là chuyển
                thể sáng tạo.
              </p>
              <button
                className="outline-button"
                onClick={() => {
                  setLoreFloor(floor.id);
                  setModal("lore");
                }}
              >
                Đọc tư liệu <ExternalLink size={13} />
              </button>
            </div>
          )}
          <div className="right-bottom">
            <BookOpen size={17} />
            <div>
              Truyền thuyết, được kể lại.
              <small>
                Lấy cảm hứng dân gian Đông Á.
                <br />
                Xem nguồn trong Tàng thư.
              </small>
            </div>
          </div>
        </aside>
      </div>
      <footer>
        <span>
          ÂM PHỦ DU KÝ <i /> Bản thử nghiệm 0.4
        </span>
        <span>Khám phá truyền thuyết · Kết nối người cùng đường</span>
        <button onClick={() => setModal("help")}>Hướng dẫn & thông tin</button>
      </footer>
      {notice && modal !== "settings" && (
        <div className="toast" role="status">
          <Flame size={16} />
          {notice}
          <button aria-label="Đóng thông báo" onClick={() => setNotice("")}>
            <X size={14} />
          </button>
        </div>
      )}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <section
            className={`modal ${modal === "lore" ? "wide-modal" : ""} ${modal === "models" ? "model-library-modal" : ""} ${modal === "settings" ? "settings-modal" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={
              modal === "join"
                ? "Bắt đầu hành trình"
                : modal === "lore"
                  ? "Tàng thư âm giới"
                  : modal === "settings"
                    ? "Cài đặt trò chơi"
                    : "Thông tin hành trình"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="Đóng hộp thoại"
              onClick={() => setModal(null)}
            >
              <X size={20} />
            </button>
            {modal === "settings" && (
              <SettingsPanel
                settings={settings}
                onChange={(next) => setSettings(normalizeSettings(next))}
                saved={settingsSaved}
                appearanceStatus={appearanceStatus}
                joined={joined}
                onClose={() => setModal(null)}
                onAudioGesture={() => {
                  void audioRef.current?.unlock();
                }}
                onTestSound={() => {
                  void audioRef.current
                    ?.unlock()
                    .then(() => audioRef.current?.play("rescue"));
                }}
              />
            )}
            {modal === "join" && (
              <>
                <span className="section-kicker">
                  QUỶ MÔN QUAN · ĐĂNG KÝ LỮ KHÁCH
                </span>
                <h2>
                  Một cái tên.
                  <br />
                  Một người cùng đường.
                </h2>
                <p>
                  Tiến trình lưu trên máy chủ bằng mã hành trình trong thẻ trình
                  duyệt này. Giữ thẻ để tiếp tục sau khi tải lại.
                </p>
                <form onSubmit={join} className="join-form">
                  <label>
                    Tên lữ khách
                    <input
                      autoFocus
                      required
                      maxLength={24}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Mộc Miên"
                    />
                  </label>
                  <label>
                    Mã phòng đồng hành
                    <input
                      required
                      pattern="[A-Za-z0-9-]{1,20}"
                      maxLength={20}
                      value={room}
                      onChange={(e) => setRoom(e.target.value.toUpperCase())}
                    />
                  </label>
                  <p>
                    Cùng mã phòng để gặp nhau · Tối đa 16 người/phòng.
                    <br />
                    Mở thẻ mới để thử với nhân vật thứ hai.
                  </p>
                  <label>
                    Chọn phe đồng hành
                    <select
                      aria-label="Chọn phe đồng hành"
                      value={team}
                      onChange={(e) => setTeam(e.target.value as Team | "auto")}
                    >
                      <option value="auto">Tự chia đều A / B / C</option>
                      <option value="A">Phe A · Hội Đèn Lồng</option>
                      <option value="B">Phe B · Hội Sương Khói</option>
                      <option value="C">Phe C · Hội Lá Bùa</option>
                    </select>
                  </label>
                  <p>
                    Vào game là vong hồn. Cùng phe để cứu nhau và so điểm; cùng
                    mã phòng để gặp cả phe đối thủ.
                  </p>
                  <button className="gold-button" type="submit">
                    Bước vào âm giới <ChevronRight size={16} />
                  </button>
                </form>
              </>
            )}
            {modal === "models" && (
              <MythologyLibrary
                key={`${libraryTab}-${libraryCharacter}-${floor.id}`}
                initialTab={libraryTab}
                initialCharacter={libraryCharacter}
                initialFloor={floor.id}
              />
            )}
            {modal === "lore" && (
              <>
                <span className="section-kicker">
                  TÀNG THƯ · TRUYỀN THUYẾT & CHUYỂN THỂ
                </span>
                <h2>Mười tám tầng địa ngục</h2>
                <p>
                  Game theo một danh sách dân gian phổ biến, không coi đây là hệ
                  thống duy nhất hay giáo lý thống nhất. Thập điện là hệ thống
                  quan tòa; không đồng nhất với 18 tầng.
                </p>
                <select
                  aria-label="Chọn tầng đọc điển tích"
                  value={loreFloor}
                  onChange={(e) => setLoreFloor(Number(e.target.value))}
                >
                  {floors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.id}. {f.name} · {f.han}
                    </option>
                  ))}
                </select>
                <div className="lore-model-scene">
                  <svg
                    viewBox="0 0 360 300"
                    role="img"
                    aria-label={`Minh họa hình phạt tầng ${loreFloor}`}
                  >
                    <PunishmentStage floor={loreFloor} />
                  </svg>
                </div>
                <div className="lore-detail">
                  <svg
                    viewBox="0 0 180 160"
                    role="img"
                    aria-label={`Minh họa sáng tác: ${floors[loreFloor - 1].motif}`}
                  >
                    <circle
                      cx="90"
                      cy="80"
                      r="65"
                      fill="none"
                      stroke="#736c4b"
                    />
                    <Motif
                      x={90}
                      y={80}
                      symbol={floors[loreFloor - 1].symbol}
                      scale={1.3}
                      color={floors[loreFloor - 1].color}
                    />
                  </svg>
                  <div>
                    <h3>
                      {floors[loreFloor - 1].name} · {floors[loreFloor - 1].han}
                    </h3>
                    <p>
                      <b>Tên / hình tượng:</b> {floors[loreFloor - 1].motif}.
                      [S1]
                    </p>
                    <p>
                      <b>Hình phạt / cảnh xét nghiệp:</b>{" "}
                      {punishments[loreFloor - 1].title}.{" "}
                      {punishments[loreFloor - 1].description}
                    </p>
                    <p>
                      <b>Chủ đề trong bản kể tiếng Việt:</b>{" "}
                      {floors[loreFloor - 1].traditional}. [S6] Đây là nhãn của
                      dị bản, không phải quy tắc phán xét người chơi.
                    </p>
                    <p>
                      <b>Ý nghĩa theo dị bản đã chọn:</b>{" "}
                      {floors[loreFloor - 1].meaning}
                    </p>
                    <p>
                      <b>Bài học chuyển thể của game:</b>{" "}
                      {floors[loreFloor - 1].reflection}
                    </p>
                    <p>
                      <b>Thiết kế cảnh:</b>{" "}
                      {floors[loreFloor - 1].elements.join(", ")}.
                    </p>
                    <small>
                      Hình vector gốc và thành phần cảnh do dự án sáng tác;
                      không phải ảnh di tích hay bản phục dựng lịch sử.
                    </small>
                  </div>
                </div>
                <h3>Nguồn và hình ảnh tham khảo</h3>
                <div className="sources">
                  {sources.map((s) => (
                    <a key={s.id} href={s.url} target="_blank" rel="noreferrer">
                      <b>
                        {s.id} · {s.title} <ExternalLink size={12} />
                      </b>
                      <small>{s.note}</small>
                    </a>
                  ))}
                </div>
                <p className="muted">
                  Không có đủ căn cứ để khẳng định dị bản nào được nhắc đến
                  nhiều nhất trên toàn bộ cộng đồng Việt Nam. Những mô tả kỳ thị
                  trong một số dị bản không được dùng làm quy tắc đạo đức của
                  game.
                </p>
              </>
            )}
            {modal === "quiz" && (
              <>
                <span className="section-kicker">
                  DẪN HỒN SỨ · TẦNG {floor.id}
                </span>
                <h2>
                  {complete
                    ? "Ấn ký đã được trao."
                    : "Ánh sáng soi được đường.\nLòng người soi được gì?"}
                </h2>
                <p>{floor.reflection}</p>
                {complete ? (
                  <>
                    <p>Hãy đến cổng phía bắc để tiếp tục hành trình.</p>
                    <button
                      className="gold-button"
                      onClick={() => {
                        setModal(null);
                        action("gate");
                      }}
                    >
                      Đi đến cổng <ArrowDown size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <p>
                      {world.lanterns.every(Boolean)
                        ? floor.question
                        : "Trước hết, hãy thắp cả hai đèn dẫn hồn. Bạn bè trong phòng có thể giúp bạn."}
                    </p>
                    <div className="answers">
                      {floor.choices.map((choice, i) => (
                        <button
                          key={choice}
                          disabled={!world.lanterns.every(Boolean)}
                          onClick={() => socket.current?.emit("answer", i)}
                        >
                          <span>{String.fromCharCode(65 + i)}</span>
                          {choice}
                          <ChevronRight size={14} />
                        </button>
                      ))}
                    </div>
                    <small>Đối thoại và lựa chọn là sáng tác cho game.</small>
                  </>
                )}
              </>
            )}
            {modal === "help" && (
              <>
                <span className="section-kicker">CẨM NANG LỮ KHÁCH</span>
                <h2>
                  Đừng vội xuống sâu.
                  <br />
                  Hãy đi cùng nhau.
                </h2>
                <ol className="help-list">
                  <li>
                    Nhập tên và mã phòng. Bạn bè dùng cùng mã phòng sẽ gặp nhau.
                  </li>
                  <li>
                    Nhấp lên cảnh hoặc dùng WASD / phím mũi tên để di chuyển.
                  </li>
                  <li>
                    Nhấp đèn / nhân vật, hoặc đến gần rồi nhấn E. Các mục nhiệm
                    vụ cũng dẫn bạn tự đi đến nơi.
                  </li>
                  <li>
                    Thắp hai đèn, trả lời Dẫn hồn sứ để nhận ấn; đến cổng phía
                    bắc để xuống tầng.
                  </li>
                  <li>
                    Đọc tư liệu của cả 18 tầng trong Tàng thư. Các tầng đã mở có
                    thể quay lại từ địa đồ.
                  </li>
                  <li>
                    Chọn vong trên bản đồ hoặc bảng tương tác. F đẩy, G gõ đầu,
                    R kéo/thả, T ném, Q đỡ, C cứu, V đặt chuối, X dọn bẫy. Space
                    để vùng vẫy khi bị giữ.
                  </li>
                  <li>
                    Hai cú gõ trong 4 giây mới gây choáng. Chỉ kéo được người
                    choáng; ném cần đưa người tới vòng ném của tầng. Vùng nghỉ
                    và hào quang bảo vệ chặn các đòn mới.
                  </li>
                </ol>
                <p>
                  Chơi đơn hoặc cùng tối đa 16 người/phòng, chia phe A/B/C. Cùng
                  phe vẫn trêu nhau được; cứu bạn khỏi đối thủ cũng có điểm.
                  Chat và điểm phe dùng chung trong phòng, đèn dùng chung ở từng
                  tầng. Dính hình phạt sẽ hồi hồn và giữ nguyên ấn khám phá.
                </p>
                <p className="muted">
                  Đây là MVP chạy với một máy chủ Node.js. Tiến trình lưu trên
                  máy chủ; chat và đèn sẽ mất khi phòng trống hoặc máy chủ khởi
                  động lại. Mã phòng không phải mật khẩu.
                </p>
                {joined && (
                  <button
                    className="outline-button"
                    onClick={() => {
                      joinRef.current = false;
                      socket.current?.disconnect();
                      location.reload();
                    }}
                  >
                    <LogOut size={14} /> Rời phòng
                  </button>
                )}
              </>
            )}
            {modal === "finish" && (
              <>
                <span className="section-kicker">
                  CHUYỂN LUÂN · MẠNH BÀ · LỤC ĐẠO
                </span>
                <h2>Khép một vòng. Mở một đời.</h2>
                <RebirthPanel
                  canRebirth={me?.floor === 18 && me.completed.length === 18}
                  cycles={me?.cycles || 0}
                  onRebirth={() => socket.current?.emit("reincarnate")}
                />
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
