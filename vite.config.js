import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 开发环境使用根路径，生产环境（GitHub Pages）使用 /yijing-oracle/
  base: process.env.NODE_ENV === 'production' ? '/yijing-oracle/' : '/',
})
