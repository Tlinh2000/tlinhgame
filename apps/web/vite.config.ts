import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backend = `http://127.0.0.1:${process.env.SERVER_PORT ?? '3100'}`;
export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.WEB_HOST ?? '127.0.0.1',
    port: Number(process.env.PORT ?? 5173),
    strictPort: true,
    allowedHosts: ['terminal.local'],
    proxy: {
      '/api': { target: backend, headers: { origin: 'http://localhost:5173' } },
      '/healthz': { target: backend },
      '/readyz': { target: backend },
      '/socket.io': { target: backend, ws: true, headers: { origin: 'http://localhost:5173' } },
    },
  },
  build: { target: 'es2022', chunkSizeWarningLimit: 800 },
});
