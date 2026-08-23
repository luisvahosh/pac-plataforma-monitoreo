import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Para desarrollo local sin Docker: redirige /api al backend en localhost.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  preview: {
    host: true,
    port: 4173,
    // Detrás del nginx del host, el Host header es el dominio real: permitirlo.
    allowedHosts: true,
  },
});
