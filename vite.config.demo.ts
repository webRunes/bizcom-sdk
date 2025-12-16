import { defineConfig } from 'vite';

export default defineConfig({
  base: '/bizcom-sdk/',
  build: {
    outDir: 'dist-demo',
    emptyOutDir: true
  }
});
