import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.SOMA_API_PROXY_TARGET || 'https://soma-api-one.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
