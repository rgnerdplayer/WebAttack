import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 2. 這邊設定：當前端碰到 /api 開頭的請求，就轉發給 8000 號房的後端 [cite: 904, 906]
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})