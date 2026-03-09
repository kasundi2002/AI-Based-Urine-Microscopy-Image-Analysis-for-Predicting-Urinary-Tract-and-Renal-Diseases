import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui')) return 'mui';
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('framer-motion')) return 'framer-motion';
            if (id.includes('jspdf')) return 'jspdf';
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'react';
            return 'vendor';
          }
        }
      }
    }
  }
})
