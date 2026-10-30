import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(0).max(65535).default(3100),
  HOST: z.string().min(1).optional(),
  ALLOWED_ORIGINS: z.string().optional(),
});

export interface ServerConfig {
  environment: 'development' | 'test' | 'production';
  port: number;
  host: string;
  allowedOrigins: string[];
}

export function readConfig(env: NodeJS.ProcessEnv): ServerConfig {
  const input = envSchema.parse(env);
  const rawOrigins = input.ALLOWED_ORIGINS ?? (input.NODE_ENV === 'production' ? '' : 'http://localhost:5173,http://127.0.0.1:5173');
  const allowedOrigins = rawOrigins.split(',').map(value => value.trim()).filter(Boolean);
  if (allowedOrigins.length === 0) throw new Error('Cần cấu hình ALLOWED_ORIGINS trước khi chạy production.');
  for (const origin of allowedOrigins) {
    const url = new URL(origin);
    if (!['https:', 'http:'].includes(url.protocol) || url.origin !== origin) throw new Error('ALLOWED_ORIGINS chỉ chứa origin HTTP/HTTPS, không có dấu / cuối.');
    if (input.NODE_ENV === 'production' && url.protocol !== 'https:') throw new Error('Production yêu cầu origin HTTPS.');
  }
  return {
    environment: input.NODE_ENV,
    port: input.PORT,
    host: input.HOST ?? (input.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'),
    allowedOrigins,
  };
}
