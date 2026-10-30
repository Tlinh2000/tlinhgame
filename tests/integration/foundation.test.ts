import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../apps/server/src/app.js';
import { readConfig } from '../../apps/server/src/config.js';
import { PROTOCOL_VERSION, systemStatusSchema } from '@tlinhgame/shared';
import type { ClientToServerEvents, ServerToClientEvents, ProbeEvent } from '@tlinhgame/shared';

const ORIGIN = 'http://localhost:5173';
type Client = Socket<ServerToClientEvents, ClientToServerEvents>;
const pause = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));
async function eventually(check: () => boolean) {
  const deadline = Date.now() + 2000;
  while (!check()) { if (Date.now() > deadline) throw new Error('Không nhận được trạng thái mong đợi'); await pause(15); }
}

describe('Bộ khung HTTP và Socket.IO thật', () => {
  let server: ReturnType<typeof createApp>;
  let base: string;
  let clients: Client[];
  beforeEach(async () => {
    server = createApp({ environment: 'test', port: 0, host: '127.0.0.1', allowedOrigins: [ORIGIN] });
    base = `http://127.0.0.1:${await server.listen()}`;
    clients = [];
  });
  afterEach(async () => { for (const client of clients) client.disconnect(); await server.close(); });
  function client(options: { origin?: string; protocolVersion?: number; namespace?: string; transport?: 'websocket' | 'polling' } = {}) {
    const socket: Client = io(`${base}${options.namespace ?? '/diagnostics'}`, {
      autoConnect: false, forceNew: true, reconnection: false,
      transports: [options.transport ?? 'websocket'],
      extraHeaders: { Origin: options.origin ?? ORIGIN },
      auth: { protocolVersion: options.protocolVersion ?? PROTOCOL_VERSION, token: 'not-a-real-token' },
      timeout: 2000,
    });
    clients.push(socket);
    return socket;
  }
  async function connect(socket: Client) {
    await new Promise<void>((resolve, reject) => { socket.once('connect', () => resolve()); socket.once('connect_error', reject); socket.connect(); });
  }
  async function rejected(socket: Client) {
    return await new Promise<Error>((resolve, reject) => { socket.once('connect_error', resolve); socket.once('connect', () => reject(new Error('Kết nối không được phép đã được chấp nhận'))); socket.connect(); });
  }

  it('HTTP báo đúng khả năng hiện có, không giả vờ đã có tài khoản hoặc game', async () => {
    const health = await fetch(`${base}/healthz`);
    expect(health.status).toBe(200);
    expect(health.headers.get('x-powered-by')).toBeNull();
    const status = systemStatusSchema.parse(await (await fetch(`${base}/api/v1/status`)).json());
    expect(status.capabilities).toEqual({ diagnostics: true, authentication: false, matchmaking: false, persistence: false });
    expect(await (await fetch(`${base}/readyz`)).json()).toMatchObject({ ready: true, gameReady: false });
    expect((await fetch(`${base}/api/v1/account`)).status).toBe(503);
    expect((await fetch(`${base}/not-a-route`)).status).toBe(404);
  });
  it('hai kết nối WebSocket nhận cùng một tín hiệu do server phát', async () => {
    const first = client(); const second = client();
    let count = 0;
    const firstEvents: ProbeEvent[] = []; const secondEvents: ProbeEvent[] = [];
    first.on('diagnostic:state', state => { count = state.connections; });
    first.on('diagnostic:probe', event => firstEvents.push(event));
    second.on('diagnostic:probe', event => secondEvents.push(event));
    await connect(first); await connect(second);
    await eventually(() => count === 2);
    const requestId = randomUUID();
    const response = await first.timeout(2000).emitWithAck('diagnostic:probe', { requestId });
    expect(response.ok).toBe(true);
    await eventually(() => firstEvents.length === 1 && secondEvents.length === 1);
    expect(firstEvents[0]).toEqual(secondEvents[0]);
    expect(firstEvents[0]).toMatchObject({ requestId, sequence: 1 });
    second.disconnect();
    await eventually(() => count === 1);
  });
  it('HTTP long-polling cũng trao đổi được gói báo nhận', async () => {
    const socket = client({ transport: 'polling' });
    await connect(socket);
    expect((await socket.timeout(2000).emitWithAck('diagnostic:ping')).serverTime).toBeGreaterThan(0);
  });
  it('từ chối payload sai và không phát lại dữ liệu chưa kiểm tra', async () => {
    const socket = client(); let broadcasts = 0;
    socket.on('diagnostic:probe', () => { broadcasts++; });
    await connect(socket);
    const result = await socket.timeout(2000).emitWithAck('diagnostic:probe', { requestId: randomUUID(), coins: 9999, winner: true });
    expect(result).toEqual({ ok: false, code: 'INVALID_PAYLOAD' });
    await pause(60);
    expect(broadcasts).toBe(0);
  });
  it('gửi lại cùng yêu cầu trong một kết nối không phát tín hiệu trùng', async () => {
    const socket = client(); let broadcasts = 0;
    socket.on('diagnostic:probe', () => { broadcasts++; });
    await connect(socket);
    const payload = { requestId: randomUUID() };
    const one = await socket.timeout(2000).emitWithAck('diagnostic:probe', payload);
    const two = await socket.timeout(2000).emitWithAck('diagnostic:probe', payload);
    expect(two).toEqual(one);
    await pause(60);
    expect(broadcasts).toBe(1);
  });
  it('từ chối phiên bản giao thức không tương thích', async () => {
    const error = await rejected(client({ protocolVersion: 999 }));
    expect(error.message).toBe('PROTOCOL_MISMATCH');
  });
  it('từ chối WebSocket từ origin không được cho phép', async () => {
    await expect(rejected(client({ origin: 'https://untrusted.invalid' }))).resolves.toBeInstanceOf(Error);
  });
  it('không cho token tùy ý mở namespace game', async () => {
    const error = await rejected(client({ namespace: '/game' }));
    expect(error.message).toBe('AUTH_NOT_READY');
  });
  it('ngắt kết nối gửi quá nhanh trước khi xử lý thêm thao tác', async () => {
    const socket = client();
    await connect(socket);
    const disconnected = new Promise<void>(resolve => socket.once('disconnect', () => resolve()));
    for (let i = 0; i < 30; i++) socket.emit('diagnostic:ping', () => undefined);
    await disconnected;
    expect(socket.connected).toBe(false);
  });
  it('API không cấp quyền đọc chéo origin ngoài danh sách', async () => {
    const good = await fetch(`${base}/api/v1/status`, { headers: { Origin: ORIGIN } });
    expect(good.headers.get('access-control-allow-origin')).toBe(ORIGIN);
    const bad = await fetch(`${base}/api/v1/status`, { headers: { Origin: 'https://untrusted.invalid' } });
    expect(bad.headers.get('access-control-allow-origin')).toBeNull();
  });
});

describe('Cấu hình production', () => {
  it('yêu cầu origin rõ ràng, không dùng dấu sao hoặc URL HTTP', () => {
    expect(() => readConfig({ NODE_ENV: 'production' })).toThrow();
    expect(() => readConfig({ NODE_ENV: 'production', ALLOWED_ORIGINS: '*' })).toThrow();
    expect(() => readConfig({ NODE_ENV: 'production', ALLOWED_ORIGINS: 'http://localhost:5173' })).toThrow();
    expect(readConfig({ NODE_ENV: 'production', ALLOWED_ORIGINS: 'https://tlinhgame.example' })).toMatchObject({ host: '0.0.0.0', allowedOrigins: ['https://tlinhgame.example'] });
  });
});
