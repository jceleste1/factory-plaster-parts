import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Environment files configuration
  envPrefix: 'VITE_',
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    // Enable source maps for production debugging if error tracking is enabled
    sourcemap: process.env.VITE_ERROR_TRACKING_ENABLED === 'true' ? 'hidden' : false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
  },
  define: {
    // Make environment variables available at build time
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
