import { createServer } from 'node:http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { Server } from 'socket.io';
import { APP_VERSION, PROTOCOL_VERSION, probeRequestSchema } from '@tlinhgame/shared';
import type { ClientToServerEvents, ServerToClientEvents, SystemStatus } from '@tlinhgame/shared';
import type { ServerConfig } from './config.js';

export function createApp(config: ServerConfig) {
  const app = express();
  let shuttingDown = false;
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) { callback(null, origin !== undefined && config.allowedOrigins.includes(origin)); },
    methods: ['GET', 'OPTIONS'],
  }));
  app.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  app.get('/healthz', (_req, res) => { res.json({ status: 'ok', service: 'tlinhgame-server' }); });
  app.get('/readyz', (_req, res) => { res.status(shuttingDown ? 503 : 200).json({ ready: !shuttingDown, scope: 'foundation', gameReady: false }); });
  app.use('/api', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'RATE_LIMITED', message: 'Bạn thao tác quá nhanh. Vui lòng chờ một chút.' } }));
  app.get('/api/v1/status', (_req, res) => {
    const status: SystemStatus = {
      name: 'TlinhGame', version: APP_VERSION, stage: 'foundation', protocolVersion: PROTOCOL_VERSION,
      serverTime: Date.now(), capabilities: { diagnostics: true, authentication: false, matchmaking: false, persistence: false },
    };
    res.json(status);
  });
  app.get('/api/v1/account', (_req, res) => { res.status(503).json({ error: 'AUTH_NOT_READY', message: 'Tài khoản được triển khai ở phần tiếp theo.' }); });
  app.use((_req, res) => { res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy đường dẫn.' }); });

  const httpServer = createServer(app);
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    serveClient: false,
    maxHttpBufferSize: 8192,
    connectTimeout: 10_000,
    pingTimeout: 15_000,
    cors: { origin: config.allowedOrigins, methods: ['GET', 'POST'] },
    allowRequest(req, callback) {
      const origin = req.headers.origin;
      callback(null, !shuttingDown && typeof origin === 'string' && config.allowedOrigins.includes(origin));
    },
  });

  // Kênh kiểm tra công khai, không phải tài khoản hoặc phòng thi đấu.
  const diagnostics = io.of('/diagnostics');
  let sequence = 0;
  diagnostics.use((socket, next) => {
    if (socket.handshake.auth.protocolVersion !== PROTOCOL_VERSION) return next(new Error('PROTOCOL_MISMATCH'));
    const sameAddress = [...diagnostics.sockets.values()].filter(peer => peer.handshake.address === socket.handshake.address).length;
    if (diagnostics.sockets.size >= 100 || sameAddress >= 12) return next(new Error('CONNECTION_LIMIT'));
    next();
  });
  const publishState = () => diagnostics.emit('diagnostic:state', { connections: diagnostics.sockets.size, serverTime: Date.now(), protocolVersion: PROTOCOL_VERSION });
  diagnostics.on('connection', socket => {
    let tokens = 12;
    let lastRefill = Date.now();
    const recentRequests = new Map<string, number>();
    const consume = () => {
      const now = Date.now();
      tokens = Math.min(12, tokens + (now - lastRefill) / 1000);
      lastRefill = now;
      if (tokens < 1) return false;
      tokens -= 1;
      return true;
    };
    socket.use((_packet, next) => {
      if (consume()) next();
      else socket.disconnect(true);
    });
    socket.on('diagnostic:ping', ack => { if (typeof ack === 'function') ack({ serverTime: Date.now() }); });
    socket.on('diagnostic:probe', (payload, ack) => {
      if (typeof ack !== 'function') return;
      const parsed = probeRequestSchema.safeParse(payload);
      if (!parsed.success) { ack({ ok: false, code: 'INVALID_PAYLOAD' }); return; }
      const previous = recentRequests.get(parsed.data.requestId);
      if (previous !== undefined) { ack({ ok: true, serverTime: previous }); return; }
      const serverTime = Date.now();
      recentRequests.set(parsed.data.requestId, serverTime);
      if (recentRequests.size > 100) recentRequests.delete(recentRequests.keys().next().value!);
      diagnostics.emit('diagnostic:probe', { requestId: parsed.data.requestId, sequence: ++sequence, serverTime });
      ack({ ok: true, serverTime });
    });
    socket.on('disconnect', publishState);
    publishState();
  });
  // Không mở phiên chơi ẩn danh hoặc tin vào token chưa được xác thực.
  io.use((_socket, next) => next(new Error('AUTH_NOT_READY')));
  io.of('/game').use((_socket, next) => next(new Error('AUTH_NOT_READY')));

  return {
    app, httpServer, io,
    listen(): Promise<number> {
      return new Promise((resolve, reject) => {
        const onError = (error: Error) => reject(error);
        httpServer.once('error', onError);
        httpServer.listen(config.port, config.host, () => {
          httpServer.off('error', onError);
          const address = httpServer.address();
          resolve(typeof address === 'object' && address !== null ? address.port : config.port);
        });
      });
    },
    async close(): Promise<void> {
      if (shuttingDown) return;
      shuttingDown = true;
      diagnostics.emit('diagnostic:shutdown');
      await new Promise<void>(resolve => io.close(() => resolve()));
    },
  };
}
