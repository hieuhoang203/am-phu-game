import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { resolve } from "node:path";
import { attachGame } from "./game.js";
const app = express(),
  http = createServer(app),
  io = new Server(http, { maxHttpBufferSize: 8192 });
attachGame(io, resolve(process.env.SAVE_PATH || "data/progress.json"));
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, game: "Âm Phủ Du Ký", version: "0.5.0", mode: "open-world" }),
);
app.use(express.static(resolve("dist")));
app.get("/{*path}", (_req, res) => res.sendFile(resolve("dist/index.html")));
const port = Number(process.env.PORT || 3001);
http.on("error", (error: NodeJS.ErrnoException) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `Cổng ${port} đang được sử dụng. Hãy dừng bản máy chủ đang chạy trước khi khởi động lại.`
      : `Không khởi động được máy chủ: ${error.message}`,
  );
  process.exitCode = 1;
});
http.listen(port, "0.0.0.0", () =>
  console.log(`Âm Phủ Du Ký server: http://localhost:${port}`),
);
