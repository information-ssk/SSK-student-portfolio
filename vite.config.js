import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
  },
  server: {
    port: 5173,
  },
});
