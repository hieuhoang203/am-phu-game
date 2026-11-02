import { defineConfig } from "vite";
export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/socket.io": {
        target: `http://127.0.0.1:${process.env.PORT || 3001}`,
        ws: true,
      },
      "/api": `http://127.0.0.1:${process.env.PORT || 3001}`,
    },
  },
});
