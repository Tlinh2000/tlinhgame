import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';

const root = fileURLToPath(new URL('..', import.meta.url));
const { values } = parseArgs({ options: { host: { type: 'string' }, port: { type: 'string' }, strictPort: { type: 'boolean' } } });
const serverPort = Number(process.env.SERVER_PORT ?? 3100);
const webPort = Number(values.port ?? process.env.PORT ?? 5173);
const host = values.host ?? process.env.WEB_HOST ?? '127.0.0.1';
async function ensureFree(port) {
  await new Promise((resolvePort, reject) => {
    const probe = createServer();
    probe.once('error', () => reject(new Error(`Cổng ${port} đang được dùng. Hãy đóng lần chạy TlinhGame trước.`)));
    probe.listen(port, '127.0.0.1', () => probe.close(resolvePort));
  });
}
await ensureFree(serverPort);
await ensureFree(webPort);
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill('SIGTERM');
  process.exitCode = code;
  const deadline = setTimeout(() => { for (const child of children) if (child.exitCode === null) child.kill('SIGKILL'); }, 5000);
  deadline.unref();
}
function launch(args, cwd, env) {
  const child = spawn(process.execPath, args, { cwd, env: { ...process.env, ...env }, stdio: 'inherit' });
  children.push(child);
  child.once('error', error => { console.error(error.message); stop(1); });
  child.once('exit', code => { if (!stopping) stop(code ?? 1); });
}
launch(['--import', 'tsx', 'src/index.ts'], resolve(root, 'apps/server'), { PORT: String(serverPort), HOST: '127.0.0.1', NODE_ENV: 'development' });
launch([resolve(root, 'node_modules/vite/bin/vite.js')], resolve(root, 'apps/web'), { PORT: String(webPort), WEB_HOST: host, SERVER_PORT: String(serverPort) });
process.once('SIGINT', () => stop());
process.once('SIGTERM', () => stop());
console.log(`\nTlinhGame: mở http://localhost:${webPort} trong trình duyệt. Giữ cửa sổ này mở.\n`);
