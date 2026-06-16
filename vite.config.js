import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './', // GitHub Pages 등 서브경로 배포 대응(상대경로)
  plugins: [react(), tailwindcss()],
})
