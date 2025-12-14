import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BizCom',
      fileName: 'bizcom',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      output: {
        assetFileNames: 'bizcom.[ext]'
      }
    },
    minify: 'terser',
    sourcemap: true
  },
  server: {
    port: 3001
  }
});
