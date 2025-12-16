import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/bizcom-sdk/' : '/',
  server: {
    port: 3005,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      host: 'dev-bizcom-sdk.wr.io',
      protocol: 'wss',
      clientPort: 443
    },
    allowedHosts: [
      'dev-bizcom-sdk.wr.io',
      'localhost',
      '127.0.0.1'
    ]
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
}));
