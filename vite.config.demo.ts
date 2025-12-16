import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/bizcom-sdk/',
  build: {
    outDir: 'dist-demo',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
});
