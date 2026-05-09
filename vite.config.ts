import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  envDir: './backend',
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5173,
    allowedHosts: true,

    proxy: {
      '/avatars': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },

      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
