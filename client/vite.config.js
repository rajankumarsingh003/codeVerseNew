// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   base: '/', // React Router ke liye SPA fallback
// })



import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Correct Vite config for React Router + Vercel
export default defineConfig({
  plugins: [react()],
  base: './', // 👈 Use relative paths so Vercel finds JS files correctly d
})
