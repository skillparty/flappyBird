import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 6040
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
