import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 這裡就是魔法所在：設定本機代理
    proxy: {
      '/api/school-calendar': {
        target: 'https://orbit.escp.eu', // 目標主機
        changeOrigin: true,              // 騙過學校主機，讓它以為請求來自內部
        rewrite: (path) => path.replace(/^\/api\/school-calendar/, '/api/calendars/getSpecificCalendar/2f6b7c9855f563b1ad9d3f5e221a2d60f3f3fdb2'),
        secure: false,                   // 接受不安全的 SSL (解決 526 錯誤)
      }
    }
  }
})
