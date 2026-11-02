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
  res.json({ ok: true, game: "Âm Phủ Du Ký" }),
);
app.use(express.static(resolve("dist")));
app.get("/{*path}", (_req, res) => res.sendFile(resolve("dist/index.html")));
const port = Number(process.env.PORT || 3001);
http.listen(port, "0.0.0.0", () =>
  console.log(`Âm Phủ Du Ký server: http://localhost:${port}`),
);
