import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // ✅ Allow access from Replit's external web view
    port: 5173, // Optional: Replit usually handles the port internally
  },
});
