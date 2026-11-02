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
        floor: 1,
        color: ["#d9bc78", "#8fc4b1", "#bba1d1", "#8cbad6"][
          room.players.size % 4
        ],
        maxFloor: save.maxFloor,
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
      player.x = Math.max(150, Math.min(850, x));
      player.y = Math.max(140, Math.min(590, y));
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
    const near = (target: { x: number; y: number }) =>
      player && Math.hypot(player.x - target.x, player.y - target.y) < 100;
    socket.on("interact", (input: unknown) => {
      if (
        !player ||
        !room ||
        limited() ||
        typeof input !== "number" ||
        !Number.isInteger(input) ||
        !WORLD.lanterns[input]
      )
        return;
      if (!room.engine.canLeave(player))
        return notice("Đang ngã, choáng hoặc kéo người, chưa thể thắp đèn.");
      if (!near(WORLD.lanterns[input])) return notice("Hãy đến gần đèn hơn.");
      const lamps = room.lanterns.get(player.floor) || [false, false];
      if (lamps[input]) return;
      lamps[input] = true;
      room.lanterns.set(player.floor, lamps);
      tell(`${player.name} thắp đèn ${input + 1} ở tầng ${player.floor}.`);
      emit();
    });
    socket.on("answer", (answer: unknown) => {
      if (!player || !room || limited()) return;
      if (!room.engine.canLeave(player))
        return notice("Hồi hồn hoặc thả người trước khi đối thoại.");
      if (!near(WORLD.npc)) return notice("Hãy đến gần Dẫn hồn sứ để giải ấn.");
      if (
        !(room.lanterns.get(player.floor) || []).every(Boolean) ||
        (room.lanterns.get(player.floor) || []).length !== 2
      )
        return notice("Thắp cả hai đèn dẫn hồn trước.");
      if (answer !== floors[player.floor - 1].answer)
        return notice("Hãy nghĩ thêm về lòng trắc ẩn. Bạn có thể thử lại.");
      if (!player.completed.includes(player.floor)) {
        player.completed.push(player.floor);
        player.maxFloor = Math.min(
          18,
          Math.max(player.maxFloor, player.floor + 1),
        );
        saves[key] = {
          name: player.name,
          maxFloor: player.maxFloor,
          completed: player.completed,
          cycles: player.cycles || 0,
          appearance: player.appearance,
        };
        persist();
      }
      notice(
        player.floor === 18
          ? "Bạn đã hoàn thành 18 tầng. Cổng trở về đang chờ!"
          : "Ấn đã mở. Đến cổng phía bắc để xuống tầng tiếp theo.",
      );
      emit();
    });
    socket.on("travel", (floor: unknown) => {
      if (
        !player ||
        !room ||
        limited() ||
        typeof floor !== "number" ||
        !Number.isInteger(floor) ||
        floor < 1 ||
        floor > player.maxFloor
      )
        return notice("Tầng này chưa được mở.");
      if (floor === player.floor) return;
      if (!room.engine.canLeave(player))
        return notice("Phải tỉnh táo và thả người trước khi đổi tầng.");
      if (floor > player.floor && !near(WORLD.gate))
        return notice("Hãy đến cổng phía bắc để xuống tầng.");
      player.floor = floor;
      player.x = WORLD.spawn.x;
      player.y = WORLD.spawn.y;
      room.engine.join(player, player.team);
      lastMove = Date.now();
      emit();
    });
    socket.on("reincarnate", () => {
      if (!player || !room || limited()) return;
      if (!room.engine.canLeave(player))
        return notice("Hồi hồn và thả người trước khi mở lượt mới.");
      if (
        player.floor !== 18 ||
        !near(WORLD.gate) ||
        !floors.every((f) => player!.completed.includes(f.id))
      )
        return notice("Cần đủ 18 ấn và đến cổng tầng 18 để mở lượt mới.");
      const next = {
        name: player.name,
        maxFloor: 1,
        completed: [] as number[],
        cycles: (player.cycles || 0) + 1,
        appearance: player.appearance,
      };
      // Persist first: if the disk write fails, the current journey stays intact.
      const previous = saves[key];
      saves[key] = next;
      try {
        persist();
      } catch {
        saves[key] = previous;
        return notice(
          "Chưa lưu được vòng mới. Hành trình hiện tại được giữ nguyên.",
        );
      }
      player.completed = [];
      player.maxFloor = 1;
      player.floor = 1;
      player.cycles = next.cycles;
      player.x = WORLD.spawn.x;
      player.y = WORLD.spawn.y;
      room.engine.join(player, player.team);
      lastMove = Date.now();
      tell(
        `${player.name} vừa đi trọn một vòng và bắt đầu lượt ngao du ${next.cycles + 1}.`,
      );
      socket.emit("reincarnated", { cycles: next.cycles });
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
