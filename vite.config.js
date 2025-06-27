import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: [
      'all',
      'b11b8f3d-4905-49ce-84bd-4e16cae71379-00-23w6s44pz5cu1.kirk.replit.dev' // your Replit URL
    ]
  }
})
