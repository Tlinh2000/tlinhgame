import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { PROTOCOL_VERSION, diagnosticStateSchema, probeEventSchema, systemStatusSchema } from '@tlinhgame/shared';
import type { ClientToServerEvents, ServerToClientEvents, ProbeEvent, SystemStatus } from '@tlinhgame/shared';
import { createRequestId } from './requestId';

type DiagnosticSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
type Connection = 'connecting' | 'online' | 'offline' | 'incompatible';
interface NetworkValue {
  connection: Connection;
  connections: number | null;
  latency: number | null;
  status: SystemStatus | null;
  events: ProbeEvent[];
  sending: boolean;
  error: string | null;
  sendProbe: () => Promise<void>;
  reconnect: () => void;
}
const Context = createContext<NetworkValue | null>(null);
function serviceOrigin(value: string | undefined): string {
  if (!value?.trim()) return window.location.origin;
  const url = new URL(value.trim());
  if (url.origin !== value.trim() || !['https:', 'http:'].includes(url.protocol)) throw new Error('URL máy chủ phải là origin HTTP/HTTPS, không thêm dấu / cuối.');
  if (window.location.protocol === 'https:' && url.protocol !== 'https:') throw new Error('Website HTTPS cần kết nối máy chủ HTTPS.');
  return url.origin;
}
export function NetworkProvider({ children }: { children: ReactNode }) {
  const socket = useRef<DiagnosticSocket | null>(null);
  const [connection, setConnection] = useState<Connection>('connecting');
  const [connections, setConnections] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [events, setEvents] = useState<ProbeEvent[]>([]);
  const [sending, setSending] = useState(false);
  const busy = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const refreshStatus = useRef<() => void>(() => undefined);
  useEffect(() => {
    let alive = true;
    let current: DiagnosticSocket | null = null;
    const abort = new AbortController();
    let statusTimer: ReturnType<typeof setInterval> | undefined;
    let pingTimer: ReturnType<typeof setInterval> | undefined;
    try {
      const apiOrigin = serviceOrigin(import.meta.env.VITE_API_URL);
      const socketOrigin = serviceOrigin(import.meta.env.VITE_SOCKET_URL);
      const refresh = async () => {
        try {
          const response = await fetch(`${apiOrigin}/api/v1/status`, { signal: AbortSignal.any([abort.signal, AbortSignal.timeout(5000)]), cache: 'no-store' });
          if (!response.ok) throw new Error('HTTP_ERROR');
          const parsed = systemStatusSchema.safeParse(await response.json());
          if (!parsed.success) throw new Error('STATUS_FORMAT');
          if (alive) setStatus(parsed.data);
        } catch { if (alive) setStatus(null); }
      };
      refreshStatus.current = () => void refresh();
      void refresh();
      statusTimer = setInterval(() => void refresh(), 20_000);
      current = io(`${socketOrigin}/diagnostics`, { auth: { protocolVersion: PROTOCOL_VERSION }, reconnection: true, reconnectionDelay: 1000, reconnectionDelayMax: 8000, timeout: 5000 });
      socket.current = current;
      const ping = () => {
        if (!current?.connected) return;
        const started = performance.now();
        void current.timeout(4000).emitWithAck('diagnostic:ping').then(() => { if (alive) setLatency(Math.round(performance.now() - started)); }).catch(() => { if (alive) setLatency(null); });
      };
      current.on('connect', () => { if (!alive) return; setConnection('online'); setError(null); ping(); void refresh(); });
      current.on('connect_error', event => {
        if (!alive) return;
        setConnection(event.message === 'PROTOCOL_MISMATCH' ? 'incompatible' : 'offline');
        setConnections(null); setLatency(null);
        setError(event.message === 'CONNECTION_LIMIT' ? 'Đã đạt giới hạn cửa sổ kiểm tra. Hãy đóng bớt cửa sổ rồi kết nối lại.' : 'Chưa kết nối được máy chủ. Hệ thống sẽ thử lại khi đường truyền sẵn sàng.');
      });
      current.on('disconnect', () => { if (alive) { setConnection('offline'); setConnections(null); setLatency(null); } });
      current.on('diagnostic:state', payload => {
        const parsed = diagnosticStateSchema.safeParse(payload);
        if (alive && parsed.success) setConnections(parsed.data.connections);
      });
      current.on('diagnostic:probe', payload => {
        const parsed = probeEventSchema.safeParse(payload);
        if (alive && parsed.success) setEvents(previous => [parsed.data, ...previous.filter(event => event.sequence !== parsed.data.sequence)].slice(0, 5));
      });
      current.on('diagnostic:shutdown', () => { if (alive) setError('Máy chủ đang khởi động lại. Vui lòng chờ kết nối trở lại.'); });
      pingTimer = setInterval(ping, 10_000);
    } catch (event) {
      setConnection('offline'); setError(event instanceof Error ? event.message : 'Cấu hình kết nối chưa đúng.');
    }
    return () => { alive = false; abort.abort(); clearInterval(statusTimer); clearInterval(pingTimer); current?.disconnect(); socket.current = null; };
  }, []);
  const sendProbe = useCallback(async () => {
    if (busy.current) return;
    const current = socket.current;
    if (!current?.connected) { setError('Cần kết nối máy chủ trước khi gửi tín hiệu.'); return; }
    busy.current = true; setSending(true); setError(null);
    try {
      const result = await current.timeout(4000).emitWithAck('diagnostic:probe', { requestId: createRequestId() });
      if (!result.ok) setError('Máy chủ từ chối tín hiệu. Vui lòng chờ rồi thử lại.');
    } catch { setError('Chưa nhận được phản hồi. Kiểm tra máy chủ và thử lại.'); }
    finally { busy.current = false; setSending(false); }
  }, []);
  return <Context.Provider value={{ connection, connections, latency, status, events, sending, error, sendProbe,
    reconnect: () => { if (!socket.current?.connected) { setConnection('connecting'); socket.current?.connect(); } refreshStatus.current(); },
  }}>{children}</Context.Provider>;
}
export function useNetwork(): NetworkValue {
  const value = useContext(Context);
  if (!value) throw new Error('Thiếu NetworkProvider');
  return value;
}
