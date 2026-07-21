import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv gives us access to VITE_* variables inside vite.config.ts.
  // Prefix '' means "load ALL vars", so VITE_DEV_PROXY_TARGET (non-VITE_ prefixed
  // vars aren't loaded by default; using '' avoids that trap).
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || 'http://localhost:3000';

  return {
    plugins: [react()],
    base: './',
    build: {
      outDir: 'dist',
      // Android WebView on API 24+ (Android 7) is Chromium 89+; target ES2020 keeps
      // bundle small without needing legacy polyfills.
      target: 'es2020',
      // esbuild minify is faster and produces comparably-small output to terser;
      // matters for local rebuild cycles when iterating on the Capacitor app.
      minify: 'esbuild',
      cssMinify: 'esbuild',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      assetsInlineLimit: 4096,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          // Split vendors so React/Capacitor don't force a full re-download of the
          // main app bundle when application code changes.
          manualChunks: {
            react: ['react', 'react-dom'],
            capacitor: [
              '@capacitor/core',
              '@capacitor/app',
              '@capacitor/keyboard',
              '@capacitor/status-bar',
              '@capacitor/preferences',
            ],
            dropzone: ['react-dropzone'],
            virtualization: ['react-window'],
          },
        },
      },
    },
    esbuild: {
      // Strip console/debugger in prod builds — tiny bundle savings, but also
      // avoids leaking dev-time logs on the Android WebView.
      drop: ['console', 'debugger'],
      legalComments: 'none',
    },
    server: {
      port: 5173,
      proxy: {
        // Dev-only proxy: keep the browser same-origin (localhost:5173) so we
        // don't hit CORS during development. Point VITE_DEV_PROXY_TARGET at
        // the backend origin (no /api suffix) — e.g. https://s3.archives.my.id
        // or http://localhost:3000 for local backend. VITE_API_URL should be
        // EMPTY in dev so requests go to /api → this proxy.
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
