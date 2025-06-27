import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    hmr: {
      clientPort: 443
    },
    origin: 'https://'+process.env.REPL_SLUG+'.'+process.env.REPL_OWNER+'.repl.co',
    // Override default behavior to allow any Replit domain
    allowedHosts: 'all',
  }
})
