import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // ← this exposes it to Replit
    port: 3000        // ← default Vite port
  }
})
