import { createServer } from "node:net";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function backendPort(value = process.env.PORT) {
  const port = Number(value || 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("PORT phải là số nguyên từ 1 đến 65535.");
  return port;
}

export function checkPort(port) {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", (error) => {
      reject(
        new Error(
          error.code === "EADDRINUSE"
            ? `Cổng ${port} đang được sử dụng. Hãy dừng bản chạy trước (Ctrl+C trong cửa sổ đang chạy game) rồi thử lại.`
            : `Không mở được cổng ${port}: ${error.message}`,
        ),
      );
    });
    probe.listen({ port, host: "0.0.0.0", exclusive: true }, () =>
      probe.close((error) => (error ? reject(error) : resolve())),
    );
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const port = backendPort();
    if (process.argv.includes("--dev") && port === 5173)
      throw new Error("PORT của máy chủ phải khác cổng giao diện 5173.");
    await checkPort(port);
    if (process.argv.includes("--dev")) {
      await checkPort(5173);
    }
  } catch (error) {
    console.error(`Không thể khởi động game: ${error.message}`);
    process.exitCode = 1;
  }
}
