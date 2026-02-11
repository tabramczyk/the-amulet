import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/the-amulet/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@specs': resolve(__dirname, 'specs'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
    allowedHosts: [
      "cde.grupa.onet"
    ]
  },
});
