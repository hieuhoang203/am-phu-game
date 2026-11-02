import {
  MAP,
  regionFor,
  near as isNear,
  clearSegment,
  pointKey,
} from "../shared/exploration";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  mkdirSync,
  writeFileSync,
  renameSync,
} from "node:fs";
import { dirname } from "node:path";
import type { Server, Socket } from "socket.io";
import { MischiefEngine } from "./mischief";
import type { Team } from "../shared/mischief";
import {
  normalizeAppearance,
  validAppearance,
  type SoulAppearance,
} from "../shared/customization";
import {
  floors,
  WORLD,
  type Player,
  type ChatMessage,
} from "../shared/world.js";
type Save = {
  name: string;
  maxFloor: number;
  completed: number[];
  cycles?: number;
  appearance?: SoulAppearance;
  region?: number;
  visited?: number[];
  discoveries?: string[];
  sparks?: number;
};
type Room = {
  players: Map<string, Player>;
  lanterns: Map<number, boolean[]>;
  chat: ChatMessage[];
  engine: MischiefEngine;
};
export function attachGame(io: Server, savePath: string) {
  const rooms = new Map<string, Room>();
  const saves: Record<string, Save> = existsSync(savePath)
    ? JSON.parse(readFileSync(savePath, "utf8"))
    : {};
  const active = new Map<string, string>();
  const broadcast = (room: Room) => {
    for (const peer of room.players.values())
      io.to(peer.id).emit("world", {
        players: [...room.players.values()].filter(
          (p) => p.floor === peer.floor,
        ),
        lanterns: room.lanterns.get(peer.floor) || [false, false],
        chat: room.chat,
        social: room.engine.snapshot(peer.floor),
      });
  };
  const timer = setInterval(() => {
    for (const room of rooms.values()) {
      room.engine.tick();
      broadcast(room);
    }
  }, 100);
  timer.unref();
  io.httpServer?.once("close", () => clearInterval(timer));
  const persist = () => {
    mkdirSync(dirname(savePath), { recursive: true });
    writeFileSync(savePath + ".tmp", JSON.stringify(saves));
    renameSync(savePath + ".tmp", savePath);
  };
  io.on("connection", (socket: Socket) => {
    let room: Room | undefined,
      roomId = "",
      player: Player | undefined,
      key = "",
      lastMove = Date.now(),
      lastChat = 0,
      windowStart = Date.now(),
      actions = 0;
    const limited = () => {
      const now = Date.now();
      if (now - windowStart > 1000) {
        windowStart = now;
        actions = 0;
      }
      return ++actions > 45;
    };
    const emit = () => {
      if (!room || !player) return;
      broadcast(room);
    };
    const notice = (text: string) => socket.emit("notice", text);
    const tell = (text: string) => {
      if (!room) return;
      room.chat.push({
        id: randomUUID(),
        name: "Dẫn hồn sứ",
        text,
        system: true,
      });
      room.chat = room.chat.slice(-50);
    };
    socket.on("join", (input: unknown) => {
      if (player || limited() || !input || typeof input !== "object") return;
      const p = input as Record<string, unknown>;
      const name = typeof p.name === "string" ? p.name.trim().slice(0, 24) : "";
      const code =
        typeof p.room === "string" ? p.room.trim().toUpperCase() : "";
      if (!name || !/^[A-Z0-9-]{1,20}$/.test(code))
        return notice("Tên hoặc mã phòng không hợp lệ.");
      let token =
        typeof p.token === "string" && /^[a-f0-9]{64}$/.test(p.token)
          ? p.token
          : randomBytes(32).toString("hex");
      key = createHash("sha256").update(token).digest("hex");
      if (active.has(key))
        return notice("Hành trình này đang mở ở một kết nối khác.");
      if (!rooms.has(code)) {
        const members = new Map<string, Player>();
        const created: Room = {
          players: members,
          lanterns: new Map(),
          chat: [],
          engine: new MischiefEngine(members, (text) => {
            created.chat.push({
              id: randomUUID(),
              name: "Quỷ sứ bình luận",
              text,
              system: true,
            });
            created.chat = created.chat.slice(-50);
          }),
        };
        rooms.set(code, created);
      }
      room = rooms.get(code)!;
      if (room.players.size >= 16) {
        room = undefined;
        return notice("Phòng đã đủ 16 người.");
      }
      roomId = code;
      const save = saves[key] || { name, maxFloor: 1, completed: [] };
      player = {
        id: socket.id,
        name,
        x: WORLD.spawn.x,
        y: WORLD.spawn.y,
        floor:
          save.region && save.region >= 1 && save.region <= 18
            ? save.region
            : 1,
        visited: [...new Set([1, ...(save.visited || save.completed)])],
        discoveries: save.discoveries || [],
        sparks: save.sparks || 0,
        color: ["#d9bc78", "#8fc4b1", "#bba1d1", "#8cbad6"][
          room.players.size % 4
        ],
        maxFloor: 18,
        completed: [...save.completed],
        cycles: save.cycles || 0,
        appearance: normalizeAppearance(
          p.appearance,
          normalizeAppearance(save.appearance),
        ),
      };
      const chosenTeam =
        typeof p.team === "string" && ["A", "B", "C"].includes(p.team)
          ? (p.team as Team)
          : undefined;
      room.engine.join(player, chosenTeam);
      if (!player.visited!.includes(player.floor))
        player.visited!.push(player.floor);
      room.players.set(socket.id, player);
      active.set(key, socket.id);
      socket.join(roomId);
      lastMove = Date.now();
      socket.emit("joined", { player, token, room: roomId });
      tell(`${name} vừa đến Quỷ Môn Quan.`);
      emit();
    });
    socket.on("move", (input: unknown) => {
      if (!player || !room || limited() || !input || typeof input !== "object")
        return;
      const { x, y } = input as { x: number; y: number };
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      room.engine.tick();
      const speed = room.engine.speed(player);
      if (speed === 0) return;
      const now = Date.now(),
        dt = Math.min((now - lastMove) / 1000, 0.3),
        distance = Math.hypot(x - player.x, y - player.y),
        limit = speed * dt + 2;
      if (distance > limit) return;
      lastMove = now;
      const previous = { x: player.x, y: player.y };
      if (!clearSegment(regionFor(player.floor), player, { x, y })) return;
      player.x = x;
      player.y = y;
      room.engine.moved(player, previous);
      emit();
    });
    socket.on("appearance", (input: unknown) => {
      if (!player || !room || limited()) return;
      if (!validAppearance(input)) {
        socket.emit("appearance-error", "Ngoại hình không hợp lệ.");
        return;
      }
      const appearance = normalizeAppearance(input),
        previous = saves[key];
      saves[key] = {
        name: player.name,
        maxFloor: player.maxFloor,
        completed: [...player.completed],
        cycles: player.cycles || 0,
        appearance,
        region: player.floor,
        visited: player.visited,
        discoveries: player.discoveries,
        sparks: player.sparks,
      };
      try {
        persist();
      } catch {
        saves[key] = previous;
        socket.emit(
          "appearance-error",
          "Chưa lưu được ngoại hình trên máy chủ.",
        );
        return;
      }
      player.appearance = appearance;
      socket.emit("appearance-saved", { appearance });
      emit();
    });
    socket.on("mischief", (input: unknown) => {
      if (!player || !room || limited()) return;
      const error = room.engine.action(player, input);
      if (error) notice(error);
      socket.emit("action-result", {
        ok: !error,
        action: (input as { action?: string } | null)?.action,
      });
      emit();
    });
    const saveProgress = () => {
      if (!player) return;
      const previousSave = saves[key];
      saves[key] = {
        name: player.name,
        maxFloor: 18,
        completed: player.completed,
        cycles: player.cycles,
        appearance: player.appearance,
        region: player.floor,
        visited: player.visited,
        discoveries: player.discoveries,
        sparks: player.sparks,
      };
      try {
        persist();
        return true;
      } catch {
        saves[key] = previousSave;
        notice(
          "Chưa ghi được tiến độ vào ổ đĩa. Hãy kiểm tra quyền ghi của máy chủ.",
        );
        return false;
      }
    };
    const travel = (destination: number) => {
      if (!player || !room) return;
      const portal = regionFor(player.floor).landmarks.find(
        (l) =>
          l.kind === "portal" && l.target === destination && isNear(player!, l),
      );
      if (!portal) return notice("Hãy đi tới đúng cổng nối vùng trên bản đồ.");
      if (!room.engine.canLeave(player))
        return notice("Hãy hồi hồn và thả người trước khi qua cổng.");
      player.floor = destination;
      player.x = WORLD.spawn.x;
      player.y = WORLD.spawn.y;
      if (!player.visited!.includes(destination))
        player.visited!.push(destination);
      room.engine.join(player, player.team);
      lastMove = Date.now();
      saveProgress();
      notice(
        "Đã đến " +
          floors[destination - 1].name +
          ". Bạn có thể khám phá theo hướng bất kỳ.",
      );
      emit();
    };
    socket.on("travel", (destination: unknown) => {
      if (
        limited() ||
        typeof destination !== "number" ||
        !Number.isInteger(destination) ||
        destination < 1 ||
        destination > 18
      )
        return;
      travel(destination);
    });
    socket.on("interact", (id: unknown) => {
      if (!player || !room || limited() || typeof id !== "string") return;
      const place = regionFor(player.floor).landmarks.find((l) => l.id === id);
      if (!place || !isNear(player, place))
        return notice("Hãy đến gần địa điểm để tương tác.");
      if (!room.engine.canLeave(player))
        return notice("Hãy hồi hồn và thả người trước khi tương tác.");
      if (place.kind === "portal") return travel(place.target!);
      const discovery = pointKey(player.floor, place.id);
      const fresh = !player.discoveries!.includes(discovery);
      if (fresh) {
        player.discoveries!.push(discovery);
        player.sparks =
          (player.sparks || 0) + (place.kind === "cache" ? 25 : 5);
      }
      if (place.kind === "rest" || place.id === "camp") {
        if (player.soul) {
          player.soul.energy = 100;
          player.soul.immuneUntil = Date.now() + 3000;
        }
      }
      if (place.kind === "cache")
        notice(
          fresh
            ? "Mở rương: +25 đốm hồn! Tiến độ được lưu riêng cho bạn."
            : "Bạn đã tìm thấy rương này. Thử tìm một góc khác!",
        );
      else if (place.kind === "shrine")
        socket.emit("dialog", {
          name: place.name + " · " + floors[player.floor - 1].name,
          text:
            floors[player.floor - 1].meaning +
            " " +
            floors[player.floor - 1].reflection,
        });
      else if (place.kind === "npc")
        socket.emit("dialog", {
          name: place.name,
          text: place.description,
          rebirth: player.floor === 18 && place.id === "camp",
        });
      else notice(place.description + (fresh ? " +5 đốm hồn." : ""));
      saveProgress();
      emit();
    });
    socket.on("reincarnate", () => {
      if (!player || !room || limited()) return;
      if (
        player.floor !== 18 ||
        !isNear(player, MAP.camp) ||
        !room.engine.canLeave(player)
      )
        return notice("Hãy gặp Mạnh Bà ở trạm nghỉ vùng 18 khi đã hồi hồn.");
      const previous = { ...player };
      player.cycles = (player.cycles || 0) + 1;
      player.floor = 1;
      if (!saveProgress()) {
        Object.assign(player, previous);
        return;
      }
      player.x = WORLD.spawn.x;
      player.y = WORLD.spawn.y;
      room.engine.join(player, player.team);
      lastMove = Date.now();
      tell(
        player.name +
          " trở lại Quỷ Môn Quan. Kỷ vật và khám phá vẫn còn nguyên.",
      );
      socket.emit("reincarnated", { cycles: player.cycles });
      emit();
    });
    socket.on("chat", (value: unknown) => {
      if (
        !player ||
        !room ||
        limited() ||
        typeof value !== "string" ||
        Date.now() - lastChat < 900
      )
        return;
      const message = value.trim().slice(0, 240);
      if (!message) return;
      lastChat = Date.now();
      room.chat.push({ id: randomUUID(), name: player.name, text: message });
      room.chat = room.chat.slice(-50);
      emit();
    });
    socket.on("disconnect", () => {
      if (!room || !player) return;
      room.engine.leave(player);
      room.players.delete(socket.id);
      active.delete(key);
      tell(`${player.name} đã rời hành trình.`);
      emit();
      if (room.players.size === 0) rooms.delete(roomId);
    });
  });
  return { rooms };
}
