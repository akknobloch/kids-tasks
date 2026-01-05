import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Safari on older iPads chokes on modern syntax like optional chaining unless we downlevel
    target: 'safari12',
  },
  esbuild: {
    target: 'safari12',
  },
})
