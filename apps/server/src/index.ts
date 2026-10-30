import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { readConfig } from './config.js';

loadEnv({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });
try {
  const config = readConfig(process.env);
  const server = createApp(config);
  const port = await server.listen();
  console.log(`[TlinhGame] Máy chủ khởi động tại http://${config.host}:${port}`);
  let closing = false;
  const stop = async () => {
    if (closing) return;
    closing = true;
    const deadline = setTimeout(() => process.exit(1), 8_000);
    deadline.unref();
    await server.close();
    clearTimeout(deadline);
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
} catch (error) {
  console.error('[TlinhGame] Không khởi động được:', error instanceof Error ? error.message : 'Lỗi cấu hình');
  process.exitCode = 1;
}
