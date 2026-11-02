import { WorldMotion } from "./motion";
import { actionHint } from "./actionHint";
import React, { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  Map as MapIcon,
  Settings2,
  BookOpen,
  Users,
  MessageCircle,
  X,
  Send,
  Compass,
  Footprints,
  Volume2,
  VolumeX,
  Shield,
  Hand,
  Hammer,
  Link,
  Wind,
  Heart,
  Banana,
  Sparkles,
  ChevronRight,
  Home,
  LocateFixed,
  HelpCircle,
} from "lucide-react";
import { floors, type Snapshot, type Player } from "../shared/world";
import {
  MAP,
  regionFor,
  regionRoute,
  routeTo,
  near,
  type Point,
} from "../shared/exploration";
import {
  prankRules,
  stateNames,
  teams,
  type PrankAction,
  type Team,
} from "../shared/mischief";
import { readSettings, SETTINGS_KEY, normalizeSettings } from "./settings";
import { GameAudio, type SoundCue } from "./audio";
import { WorldScene } from "./components/WorldScene";
import { CharacterSprite } from "./components/CharacterSprite";
import { SettingsPanel } from "./components/SettingsPanel";
import { MythologyLibrary } from "./components/MythologyLibrary";
import "./mythology.css";
import "./mischief.css";
import "./interface.css";
import "./world.css";
const empty: Snapshot = { players: [], lanterns: [], chat: [] };
const hotkeys: Record<string, PrankAction> = {
  f: "push",
  g: "bonk",
  r: "drag",
  t: "throw",
  q: "guard",
  c: "rescue",
  " ": "struggle",
  b: "banana",
  v: "disarm",
};
const actions: PrankAction[] = [
  "push",
  "bonk",
  "drag",
  "throw",
  "guard",
  "rescue",
  "banana",
  "disarm",
  "struggle",
];
const icons = {
  push: Hand,
  bonk: Hammer,
  drag: Link,
  release: Link,
  throw: Wind,
  guard: Shield,
  rescue: Heart,
  banana: Banana,
  struggle: Sparkles,
  disarm: Footprints,
};
export default function App() {
  const [world, setWorld] = useState<Snapshot>(empty),
    [id, setId] = useState(""),
    [connected, setConnected] = useState(false),
    [joined, setJoined] = useState(false);
  const [name, setName] = useState(sessionStorage.getItem("ap-name") || ""),
    [room, setRoom] = useState(sessionStorage.getItem("ap-room") || "NGAODU"),
    [team, setTeam] = useState<Team>("A");
  const [settings, setSettings] = useState(readSettings),
    [saved, setSaved] = useState(true),
    [appearanceStatus, setAppearanceStatus] = useState("Đã đồng bộ");
  const [modal, setModal] = useState<
      null | "atlas" | "settings" | "library" | "help" | "party"
    >(null),
    [selected, setSelected] = useState(""),
    [notice, setNotice] = useState(""),
    [zoom, setZoom] = useState(1),
    [path, setPath] = useState<Point[]>([]);
  const [chatOpen, setChatOpen] = useState(false),
    [message, setMessage] = useState(""),
    [dialog, setDialog] = useState<{
      name: string;
      text: string;
      rebirth?: boolean;
    } | null>(null),
    [destination, setDestination] = useState<number | null>(null);
  const [pressedAction, setPressedAction] = useState<PrankAction | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(pressTimer.current), []);
  const socket = useRef<Socket | undefined>(undefined),
    worldRef = useRef(world),
    idRef = useRef(id),
    settingsRef = useRef(settings),
    modalRef = useRef(modal),
    joinedRef = useRef(joined),
    selectedRef = useRef(selected),
    route = useRef<Point[]>([]),
    keys = useRef(new Set<string>()),
    stick = useRef<Point>({ x: 0, y: 0 }),
    audio = useRef<GameAudio | undefined>(undefined);
  const motion = useRef(new WorldMotion()).current;
  const pending = useRef<string | null>(null),
    destinationRef = useRef<number | null>(null),
    lastRegion = useRef(0);
  worldRef.current = world;
  idRef.current = id;
  settingsRef.current = settings;
  modalRef.current = modal;
  joinedRef.current = joined;
  selectedRef.current = selected;
  destinationRef.current = destination;
  if (!audio.current) audio.current = new GameAudio();
  const authoritativeMe = world.players.find((p) => p.id === id);
  const me =
    authoritativeMe && motion.player?.id === id
      ? { ...authoritativeMe, x: motion.player.x, y: motion.player.y }
      : authoritativeMe;
  const floor = floors[(me?.floor || 1) - 1],
    region = regionFor(floor.id),
    target = world.players.find((p) => p.id === selected),
    closest = me
      ? region.landmarks
          .filter((l) => near(me, l))
          .sort(
            (a, b) =>
              Math.hypot(a.x - me.x, a.y - me.y) -
              Math.hypot(b.x - me.x, b.y - me.y),
          )[0]
      : undefined;
  const stop = () => {
    route.current = [];
    setPath([]);
    pending.current = null;
  };
  const sound = (cue: SoundCue) => {
    void audio.current?.unlock();
    audio.current?.play(cue);
  };
  const flushMotion = () => {
    const batch = motion.flush();
    if (batch.length && socket.current?.connected)
      socket.current.emit("input", batch);
  };
  const interact = (id: string) => {
    flushMotion();
    socket.current?.emit("interact", id);
  };
  const prank = (action: PrankAction) => {
    const p = motion.player;
    if (!p) return;
    const actual = action === "drag" && p.soul?.dragging ? "release" : action;
    const current = worldRef.current,
      target = current.players.find((v) => v.id === selectedRef.current);
    const hint = actionHint(actual, p, target, current);
    if (hint) {
      setNotice(hint);
      audio.current?.play("error");
      return;
    }
    flushMotion();
    setPressedAction(actual);
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => setPressedAction(null), 180);
    sound(
      ["bonk", "push", "throw", "rescue", "guard", "banana"].includes(actual)
        ? (actual as SoundCue)
        : "click",
    );
    socket.current?.emit("mischief", {
      action: actual,
      targetId: selectedRef.current,
    });
  };
  const walk = (point: Point, interact?: string) => {
    const p =
      motion.player ||
      worldRef.current.players.find((p) => p.id === idRef.current);
    if (!p) return;
    const r = regionFor(p.floor),
      l = r.landmarks.find((l) => near(point, l, 65) && l.kind !== "arena");
    const next = routeTo(r, p, l || point);
    route.current = next;
    setPath(next);
    pending.current = interact || l?.id || null;
    if (!next.length)
      setNotice("Lối này bị chắn. Hãy chọn một điểm trên đường.");
  };
  useEffect(() => {
    audio.current?.configure(settings.audio);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [settings]);
  useEffect(() => {
    if (!joined || !connected) return;
    setAppearanceStatus("Đang đồng bộ…");
    const t = setTimeout(
      () => socket.current?.emit("appearance", settingsRef.current.appearance),
      350,
    );
    return () => clearTimeout(t);
  }, [JSON.stringify(settings.appearance), joined, connected]);
  useEffect(() => {
    const s = io();
    socket.current = s;
    s.on("connect", () => {
      setConnected(true);
      if (joinedRef.current)
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
      setNotice("Mất kết nối. Đang kết nối lại…");
      route.current = [];
      motion.reset();
      keys.current.clear();
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
        sessionStorage.setItem("ap-room", room);
        motion.reset();
        motion.receive(
          { players: [player], lanterns: [], chat: [] },
          player.id,
          performance.now(),
        );
        setId(player.id);
        idRef.current = player.id;
        setJoined(true);
        joinedRef.current = true;
        setWorld((w) => ({ ...w, players: [player] }));
        setNotice(
          "Chào vong mới! Đi theo ý bạn. Bấm M để xem các lối nối âm giới.",
        );
      },
    );
    s.on("world", (v: Snapshot) => {
      worldRef.current = v;
      motion.receive(v, idRef.current, performance.now());
      setWorld(v);
    });
    s.on("notice", setNotice);
    s.on("dialog", setDialog);
    s.on("appearance-saved", () => setAppearanceStatus("Đã đồng bộ"));
    s.on("appearance-error", setAppearanceStatus);
    s.on("action-result", ({ ok }: { ok: boolean }) => {
      if (!ok) audio.current?.play("error");
    });
    const focus = () => audio.current?.setFocused(!document.hidden),
      blur = () => {
        keys.current.clear();
        stick.current = { x: 0, y: 0 };
        audio.current?.setFocused(false);
      };
    window.addEventListener("focus", focus);
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", focus);
    return () => {
      s.disconnect();
      window.removeEventListener("focus", focus);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", focus);
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 5500);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    if (!modal) return;
    stop();
    setDestination(null);
    keys.current.clear();
    const previous = document.activeElement as HTMLElement;
    const el = document.querySelector<HTMLElement>('[role="dialog"]');
    el?.querySelector<HTMLElement>("button,input")?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes = Array.from(
        el?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input,select,a[href]",
        ) || [],
      );
      if (!nodes.length) return;
      const first = nodes[0],
        last = nodes.at(-1)!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [modal]);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const k = e.key.toLowerCase();
      if (k === "escape") {
        setModal(null);
        setDialog(null);
        setChatOpen(false);
        stop();
        return;
      }
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      if (!joinedRef.current) return;
      if (k === "m" && !e.repeat) {
        setModal((m) => (m === "atlas" ? null : "atlas"));
        return;
      }
      if (modalRef.current) return;
      if (
        [
          "w",
          "a",
          "s",
          "d",
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
        ].includes(k)
      ) {
        e.preventDefault();
        keys.current.add(k);
        route.current = [];
        setPath([]);
        pending.current = null;
        setDestination(null);
      }
      if (k === "e" && !e.repeat) {
        const p = motion.player;
        if (p) {
          const l = regionFor(p.floor)
            .landmarks.filter((l) => near(p, l))
            .sort(
              (a, b) =>
                Math.hypot(a.x - p.x, a.y - p.y) -
                Math.hypot(b.x - p.x, b.y - p.y),
            )[0];
          if (l) interact(l.id);
        }
      }
      if (hotkeys[k] && !e.repeat) {
        e.preventDefault();
        prank(hotkeys[k]);
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  useEffect(() => {
    let frame = 0,
      previous = performance.now(),
      lastSend = previous,
      accumulated = 0;
    const update = (time: number) => {
      frame = requestAnimationFrame(update);
      const elapsed = Math.min(40, Math.max(0, time - previous));
      previous = time;
      accumulated = Math.min(40, accumulated + elapsed);
      if (time - lastSend >= 50) {
        flushMotion();
        lastSend = time;
      }
      // Simulate at most 125 Hz so 144/240 Hz screens do not overflow input batches.
      if (accumulated < 8) return;
      const dt = accumulated;
      accumulated = 0;
      if (modalRef.current || !socket.current?.connected) return;
      const p = motion.player;
      if (!p) return;
      if (p.soul && p.soul.state !== "free") {
        if (route.current.length) {
          route.current = [];
          setPath([]);
        }
        pending.current = null;
        return;
      }
      const r = regionFor(p.floor);
      if (lastRegion.current !== p.floor) {
        lastRegion.current = p.floor;
        route.current = [];
        setPath([]);
        pending.current = null;
        setSelected("");
        const dest = destinationRef.current;
        if (dest && dest !== p.floor) {
          const next = regionRoute(p.floor, dest)[1],
            portal = r.landmarks.find(
              (l) => l.kind === "portal" && l.target === next,
            )!;
          route.current = routeTo(r, p, portal);
          pending.current = portal.id;
          setPath(route.current);
        } else if (dest === p.floor) setDestination(null);
      }
      let dx = stick.current.x,
        dy = stick.current.y;
      const k = keys.current;
      dx +=
        (k.has("d") || k.has("arrowright") ? 1 : 0) -
        (k.has("a") || k.has("arrowleft") ? 1 : 0);
      dy +=
        (k.has("s") || k.has("arrowdown") ? 1 : 0) -
        (k.has("w") || k.has("arrowup") ? 1 : 0);
      const next = route.current[0];
      if (!dx && !dy && next) {
        dx = next.x - p.x;
        dy = next.y - p.y;
        if (Math.hypot(dx, dy) < 6) {
          route.current.shift();
          setPath([...route.current]);
          if (!route.current.length && pending.current) {
            interact(pending.current);
            pending.current = null;
          }
          return;
        }
      }
      const scale = Math.max(1, Math.hypot(dx, dy));
      motion.step(dx / scale, dy / scale, dt);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);

  function join(e: React.FormEvent) {
    e.preventDefault();
    if (!connected) {
      setNotice("Máy chủ chưa kết nối. Vui lòng chờ.");
      return;
    }
    sound("click");
    sessionStorage.setItem("ap-name", name.trim());
    sessionStorage.setItem("ap-room", room.trim().toUpperCase());
    sessionStorage.setItem("ap-team", team);
    socket.current?.emit("join", {
      name,
      room,
      team,
      token: sessionStorage.getItem("ap-token"),
      appearance: settings.appearance,
    });
  }
  function navigate(to: number) {
    if (!me) return;
    setModal(null);
    setDestination(to);
    if (to === me.floor) {
      stop();
      return;
    }
    const next = regionRoute(me.floor, to)[1],
      portal = region.landmarks.find((l) => l.target === next)!;
    walk(portal, portal.id);
    setNotice("Đã vạch đường. Có thể dùng phím di chuyển để hủy dẫn đường.");
  }
  const css = [
    "ow-game",
    "interface-v4",
    settings.display.reduceMotion ? "reduce-motion" : "",
    settings.display.highContrast ? "high-contrast" : "",
    settings.display.largeButtons ? "large-buttons" : "",
  ].join(" ");
  return (
    <main
      className={css}
      onPointerDown={() => {
        if (!settings.audio.muted) void audio.current?.unlock();
      }}
    >
      <WorldScene
        motion={motion}
        acting={pressedAction !== null}
        floor={floor}
        me={me}
        world={world}
        settings={settings}
        zoom={zoom}
        onZoom={setZoom}
        onGo={(p) => {
          if (!modal && !dialog) {
            setDestination(null);
            walk(p);
          }
        }}
        onSelect={setSelected}
        path={path}
        selected={selected}
      />
      <div className="ow-vignette" />
      {!joined ? (
        <div className="ow-welcome">
          <div className="ow-brand">
            <span className="ow-eyebrow">
              MỘT CHUYẾN NGAO DU KHÔNG CÓ LỊCH VỀ
            </span>
            <h1>
              Âm Phủ
              <br />
              <em>Du Ký</em>
              <i>✦</i>
            </h1>
            <p>
              Lạc xuống âm ty.
              <br />
              Tìm bạn đồng hành. Hoặc một đứa để troll.
            </p>
            <div className="ow-tags">
              <span>18 vùng tự do khám phá</span>
              <span>2–16 vong cùng phòng</span>
            </div>
          </div>
          <form className="ow-join" onSubmit={join}>
            <span className="ow-eyebrow">QUỶ MÔN QUAN · ĐANG MỞ CỬA</span>
            <h2>Vong mới, mời vào.</h2>
            <p>
              Một thế giới mở, một hội bạn quậy.
              <br />
              Cứ đi, gặp nhau rồi tính.
            </p>
            <label>
              Tên âm hồn
              <input
                required
                maxLength={24}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bạn tên gì ở kiếp trước?"
              />
            </label>
            <label>
              Mã phòng · rủ bạn dùng chung mã
              <input
                required
                pattern="(?:[A-Za-z0-9]|-){1,20}"
                maxLength={20}
                value={room}
                onChange={(e) => setRoom(e.target.value.toUpperCase())}
              />
            </label>
            <label>
              Hội đồng hành
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value as Team)}
              >
                {Object.entries(teams).map(([id, t]) => (
                  <option key={id} value={id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="ow-primary" disabled={!connected}>
              Bắt đầu ngao du <ChevronRight size={19} />
            </button>
            <div className="ow-status">
              <i className={connected ? "online" : ""} />
              {connected ? "Máy chủ sẵn sàng" : "Đang kết nối máy chủ…"}
              <button
                type="button"
                onClick={() => setModal("settings")}
                aria-label="Cài đặt"
              >
                <Settings2 size={17} />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="ow-top-left ow-glass">
            <svg viewBox="-65 -115 130 130" className="ow-avatar">
              <CharacterSprite
                id="vong-hon"
                scale={0.78}
                appearance={me?.appearance}
              />
            </svg>
            <div>
              <div className="ow-player-name">
                {me?.name}
                <span>{teams[me?.team || "A"].name}</span>
              </div>
              <div className="ow-energy">
                <i style={{ width: `${me?.soul?.energy || 0}%` }} />
              </div>
              <small>
                {Math.round(me?.soul?.energy || 0)} thể lực{" "}
                <span>✦ {me?.sparks || 0} đốm hồn</span>
              </small>
            </div>
          </div>
          <div className="ow-location">
            <span>
              ÂM GIỚI · VÙNG {floor.id.toString().padStart(2, "0")} / 18
            </span>
            <h1>{floor.name}</h1>
            <small>{floor.subtitle}</small>
            <div className="ow-compass">
              T <span>• • •</span> BẮC <span>• • •</span> Đ
            </div>
          </div>
          <div className="ow-top-right">
            <button
              className="ow-icon"
              onClick={() => setModal("atlas")}
              aria-label="Bản đồ âm giới"
              title="Bản đồ · M"
            >
              <MapIcon />
              <kbd>M</kbd>
            </button>
            <button
              className="ow-icon"
              onClick={() => setModal("party")}
              aria-label="Bạn đồng hành"
            >
              <Users />
            </button>
            <button
              className="ow-icon"
              onClick={() => setModal("library")}
              aria-label="Sổ tay truyền thuyết"
            >
              <BookOpen />
            </button>
            <button
              className="ow-icon"
              onClick={() => setModal("settings")}
              aria-label="Cài đặt"
            >
              <Settings2 />
            </button>
            <button
              className="ow-icon"
              onClick={() => setModal("help")}
              aria-label="Hướng dẫn"
            >
              <HelpCircle />
            </button>
          </div>
          <aside className="ow-expedition ow-glass">
            <span className="ow-eyebrow">CHUYẾN ĐI CỦA BẠN</span>
            <b>
              <Compass size={17} /> Tự do ngao du
            </b>
            <p>
              {destination
                ? `Đang tìm đường đến ${floors[destination - 1].name}`
                : "Đi qua cổng, tìm di tích và mở rương dọc đường."}
            </p>
            <div>
              <span>{me?.visited?.length || 1}/18 vùng đã ghé</span>
              <span>{me?.discoveries?.length || 0} khám phá</span>
            </div>
            <button
              onClick={() => {
                walk(region.landmarks.find((l) => l.id === "keeper")!);
              }}
            >
              Ghé quỷ sứ bên đường <ChevronRight size={14} />
            </button>
          </aside>
          {target && (
            <div className="ow-target ow-glass">
              <span>
                ĐANG CHỌN · {stateNames[target.soul?.state || "free"]}
              </span>
              <b>{target.name}</b>
              <small>
                Cách{" "}
                {Math.round(
                  Math.hypot((me?.x || 0) - target.x, (me?.y || 0) - target.y),
                )}{" "}
                bước · {teams[target.team || "A"].name}
              </small>
              <button onClick={() => setSelected("")} aria-label="Bỏ chọn">
                <X size={15} />
              </button>
            </div>
          )}
          <div className="ow-chat">
            <button
              className="ow-chat-toggle ow-glass"
              onClick={() => setChatOpen(!chatOpen)}
            >
              <MessageCircle size={16} />{" "}
              {chatOpen ? "Thu gọn trò chuyện" : "Trò chuyện cùng phòng"}{" "}
              <span>{world.social?.roster.length || 1} vong</span>
            </button>
            {chatOpen && (
              <div className="ow-chat-body ow-glass">
                <div className="ow-chat-log">
                  {world.chat.slice(-15).map((m) => (
                    <p key={m.id} className={m.system ? "system" : ""}>
                      <b>{m.name}</b> {m.text}
                    </p>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    socket.current?.emit("chat", message);
                    setMessage("");
                  }}
                >
                  <input
                    aria-label="Tin nhắn"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={240}
                    placeholder="Gọi đồng đội, bày trò…"
                  />
                  <button aria-label="Gửi tin nhắn">
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}
          </div>
          <div className="ow-bottom">
            <div className="ow-context">
              {closest ? (
                <button
                  className="ow-interact"
                  onClick={() => interact(closest.id)}
                >
                  <kbd>E</kbd>
                  <span>
                    {closest.kind === "portal"
                      ? `Đi tới ${floors[closest.target! - 1].name}`
                      : closest.kind === "cache"
                        ? "Mở rương đốm hồn"
                        : closest.kind === "rest"
                          ? "Nghỉ chân · Hồi thể lực"
                          : closest.kind === "arena"
                            ? "Xem sân hình phạt"
                            : `Khám phá · ${closest.name}`}
                  </span>
                  <ChevronRight size={17} />
                </button>
              ) : (
                <span className="ow-walk-hint">
                  <Footprints size={14} /> WASD / phím mũi tên hoặc chạm đất để
                  đi
                </span>
              )}
            </div>
            <div className="ow-hotbar ow-glass">
              {actions.map((a) => {
                const actual =
                    a === "drag" && me?.soul?.dragging ? "release" : a,
                  rule = prankRules[actual],
                  hint = me
                    ? actionHint(actual, me, target, world)
                    : "Đang kết nối",
                  Icon = icons[actual],
                  cd = Math.max(
                    0,
                    ((me?.soul?.cooldowns[actual] || 0) -
                      (world.social?.serverTime || Date.now())) /
                      1000,
                  );
                return (
                  <button
                    key={a}
                    className={
                      pressedAction === actual ? "ow-action-pressed" : ""
                    }
                    aria-label={rule.label}
                    title={`${rule.label} · ${rule.cost} thể lực. ${hint ? hint + ". " : ""}${rule.hint}`}
                    disabled={!connected || !!hint}
                    onClick={() => prank(actual)}
                  >
                    <kbd>{settings.display.showKeys ? rule.key : ""}</kbd>
                    <Icon size={24} />
                    <span>{rule.label}</span>
                    {cd > 0 ? (
                      <i>{cd.toFixed(1)}</i>
                    ) : (
                      <small>{rule.cost}</small>
                    )}
                  </button>
                );
              })}
            </div>
            <span className="ow-action-tip">
              Chọn một vong → Gõ 2 lần → Kéo → Đưa về sân → Ném · Q đỡ đòn · C
              cứu bạn · V gỡ bẫy
            </span>
          </div>
          <div className="ow-minimap ow-glass">
            <div>
              <span>
                <LocateFixed size={13} /> {floor.name}
              </span>
              <button
                onClick={() => setModal("atlas")}
                aria-label="Mở bản đồ lớn"
              >
                <MapIcon size={16} />
              </button>
            </div>
            <svg
              viewBox={`0 0 ${MAP.width} ${MAP.height}`}
              aria-label="Bản đồ nhỏ"
              onPointerDown={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setDestination(null);
                walk({
                  x: ((e.clientX - r.left) / r.width) * MAP.width,
                  y: ((e.clientY - r.top) / r.height) * MAP.height,
                });
              }}
            >
              <rect width={MAP.width} height={MAP.height} fill="#203c39" />
              <path
                d="M950 0Q800 400 1120 750T980 1500L1100 1900"
                stroke="#3b6c73"
                strokeWidth="180"
                fill="none"
              />
              <path
                d="M500 155V600L900 900H1490L2450 1450M900 900 240 1550M1490 900 1490 1530M1490 900 2220 590"
                stroke="#8b8968"
                strokeWidth="28"
                fill="none"
              />
              {region.landmarks.map((l) => (
                <circle
                  key={l.id}
                  cx={l.x}
                  cy={l.y}
                  r={l.kind === "portal" ? 65 : 35}
                  fill={
                    l.kind === "portal"
                      ? "#e7c88a"
                      : l.kind === "cache"
                        ? "#c79461"
                        : "#84bda8"
                  }
                />
              ))}
              {world.players.map((p) => (
                <g key={p.id}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.id === id ? 60 : 40}
                    fill={p.id === id ? "#fff3bf" : teams[p.team || "A"].color}
                    stroke="#163a39"
                    strokeWidth="15"
                  />
                </g>
              ))}
            </svg>
            <small>Cổng sáng nối vùng · Chạm để di chuyển</small>
          </div>
          <div className="ow-zoom">
            <button
              onClick={() => setZoom(Math.min(1.6, zoom + 0.15))}
              aria-label="Phóng to"
            >
              +
            </button>
            <button
              onClick={() => setZoom(Math.max(0.75, zoom - 0.15))}
              aria-label="Thu nhỏ"
            >
              −
            </button>
          </div>
          <TouchStick
            onMove={(p) => {
              stick.current = p;
              if (p.x || p.y) {
                stop();
                setDestination(null);
              }
            }}
          />
          <div className="ow-connection">
            <i className={connected ? "online" : ""} />
            {connected ? `${room} · Trực tuyến` : "Đang kết nối lại…"}
          </div>
        </>
      )}
      {notice && (
        <div role="status" className="ow-toast">
          ✦ {notice}
          <button onClick={() => setNotice("")} aria-label="Đóng thông báo">
            <X size={14} />
          </button>
        </div>
      )}
      {dialog && (
        <div
          className="ow-dialog ow-glass"
          role="dialog"
          aria-label="Đối thoại"
        >
          <button
            className="ow-close"
            onClick={() => setDialog(null)}
            aria-label="Đóng đối thoại"
          >
            <X />
          </button>
          <span className="ow-eyebrow">MỘT CUỘC GẶP DỌC ĐƯỜNG</span>
          <h2>{dialog.name}</h2>
          <p>{dialog.text}</p>
          {dialog.rebirth && (
            <button
              className="ow-primary"
              onClick={() => {
                socket.current?.emit("reincarnate");
                setDialog(null);
              }}
            >
              Qua cầu · Trở lại vùng đầu
            </button>
          )}
          <small>
            Không có lựa chọn đúng sai. Cứ tiếp tục chuyến đi của bạn.
          </small>
        </div>
      )}
      {modal && (
        <div
          className="ow-overlay"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={
              modal === "settings"
                ? "Cài đặt"
                : modal === "atlas"
                  ? "Bản đồ âm giới"
                  : modal === "library"
                    ? "Sổ tay truyền thuyết"
                    : modal === "party"
                      ? "Bạn đồng hành"
                      : "Hướng dẫn ngao du"
            }
            className={`ow-modal ${modal === "settings" ? "ow-settings" : ""}`}
          >
            <button
              className="ow-close"
              onClick={() => setModal(null)}
              aria-label="Đóng"
            >
              <X />
            </button>
            {modal === "settings" ? (
              <SettingsPanel
                settings={settings}
                onChange={(s) => setSettings(normalizeSettings(s))}
                saved={saved}
                appearanceStatus={appearanceStatus}
                joined={joined}
                onAudioGesture={() => void audio.current?.unlock()}
                onTestSound={() => sound("bonk")}
                onClose={() => setModal(null)}
              />
            ) : modal === "library" ? (
              <MythologyLibrary initialFloor={floor.id} />
            ) : modal === "atlas" ? (
              <>
                <span className="ow-eyebrow">CHỌN MỘT HƯỚNG ĐỂ BẮT ĐẦU</span>
                <h2>Bản đồ âm giới</h2>
                <p>
                  18 vùng liên thông. Chọn một vùng để vạch đường qua các cổng;
                  nhân vật sẽ thực sự đi tới đó. WASD để hủy dẫn đường.
                </p>
                <div className="ow-atlas">
                  {floors.map((f) => (
                    <button
                      key={f.id}
                      className={`${me?.floor === f.id ? "current" : ""} ${me?.visited?.includes(f.id) ? "visited" : ""}`}
                      style={
                        { "--region-color": f.color } as React.CSSProperties
                      }
                      onClick={() => navigate(f.id)}
                    >
                      <span>{f.id.toString().padStart(2, "0")}</span>
                      <b>{f.name}</b>
                      <small>{f.motif}</small>
                      <i>
                        {me?.floor === f.id
                          ? "Bạn đang ở đây"
                          : me?.visited?.includes(f.id)
                            ? "Đã ghé thăm"
                            : "Tự do khám phá"}
                      </i>
                    </button>
                  ))}
                </div>
                <div className="ow-atlas-legend">
                  <span>↑ Cổng bắc: vùng kế tiếp</span>
                  <span>↙ Bến sông: vùng trước</span>
                  <span>↘ Khe nứt: nhảy 6 vùng</span>
                </div>
              </>
            ) : modal === "party" ? (
              <>
                <span className="ow-eyebrow">BẠN ĐỒNG HÀNH & ĐỐI THỦ</span>
                <h2>Các hội trong phòng</h2>
                <p>
                  Chung mã phòng để gặp nhau. Mỗi hội có điểm troll chung; vẫn
                  có thể cứu người thuộc hội khác.
                </p>
                <div className="ow-party-scores">
                  {Object.entries(teams).map(([id, t]) => (
                    <div key={id} style={{ color: t.color }}>
                      <b>{t.name}</b>
                      <strong>{world.social?.scores[id as Team] || 0}</strong>
                    </div>
                  ))}
                </div>
                {world.social?.roster.map((p) => (
                  <div className="ow-roster" key={p.id}>
                    <b>{p.name}</b>
                    <span>{teams[p.team].name}</span>
                    <small>
                      Vùng {p.floor} · {floors[p.floor - 1].name}
                    </small>
                  </div>
                ))}
                <button
                  className="ow-primary"
                  onClick={() => {
                    void navigator.clipboard
                      ?.writeText(room)
                      .then(() => setNotice("Đã sao chép mã phòng."))
                      .catch(() => setNotice(`Mã phòng: ${room}`));
                  }}
                >
                  Sao chép mã phòng · {room}
                </button>
              </>
            ) : (
              <>
                <span className="ow-eyebrow">SỔ TAY VONG MỚI</span>
                <h2>Cứ đi, rồi sẽ gặp chuyện.</h2>
                <div className="ow-help">
                  <p>
                    <b>Khám phá thế giới</b>Đi bằng WASD, phím mũi tên, chạm đất
                    hoặc cần điều khiển trên điện thoại. Camera đi theo bạn. Lăn
                    chuột để đổi góc nhìn. M mở bản đồ lớn.
                  </p>
                  <p>
                    <b>Tương tác tại chỗ</b>Đến gần địa điểm rồi bấm E. Mở rương
                    lấy đốm hồn, tìm bia và phế tích, gặp quỷ sai, nghỉ ở trạm.
                    Ba cổng trong mỗi vùng dẫn tới những nhánh khác nhau.
                  </p>
                  <p>
                    <b>Bày trò có trình tự</b>Chạm vào vong khác để chọn. G gõ
                    hai lần trong 4 giây làm choáng, R kéo, đưa về sân hình phạt
                    rồi T ném. F chỉ đẩy ngã, không đủ điều kiện kéo. Vỏ chuối B
                    giúp cản đường.
                  </p>
                  <p>
                    <b>Luôn có cách thoát</b>Q đỡ đòn, C cứu vong, Space vùng
                    vẫy, V gỡ bẫy. Trạm nghỉ và cổng có vùng bảo hộ. Hình phạt
                    là hoạt cảnh hài ngắn; rương và kỷ vật không bị mất.
                  </p>
                  <p>
                    <b>Một hành trình của riêng bạn</b>Mọi vùng đều mở. Khám phá
                    và ngoại hình được lưu. Gặp Mạnh Bà ở vùng 18 để trở lại đầu
                    hành trình; không cần thu đủ dấu hay trả lời câu hỏi.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
function TouchStick({ onMove }: { onMove: (p: Point) => void }) {
  const [pos, setPos] = useState<Point>({ x: 0, y: 0 });
  const active = useRef(false);
  const update = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect(),
      dx = e.clientX - r.left - r.width / 2,
      dy = e.clientY - r.top - r.height / 2,
      len = Math.max(1, Math.hypot(dx, dy) / 36),
      p = { x: dx / len, y: dy / len };
    setPos(p);
    onMove({ x: p.x / 36, y: p.y / 36 });
  };
  return (
    <div
      className="ow-stick"
      role="group"
      aria-label="Cần điều khiển di chuyển"
      onPointerDown={(e) => {
        active.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e);
      }}
      onPointerMove={(e) => {
        if (active.current) update(e);
      }}
      onPointerUp={() => {
        active.current = false;
        setPos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
      }}
      onPointerCancel={() => {
        active.current = false;
        setPos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
      }}
    >
      <i style={{ transform: `translate(${pos.x}px,${pos.y}px)` }} />
    </div>
  );
}
