import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'glummest-maison-unorbitally.ngrok-free.dev',
      '.ngrok-free.dev', // Allow all ngrok hosts
      'techno-worlds.vercel.app',
      '.vercel.app',
    ],
  },
})
