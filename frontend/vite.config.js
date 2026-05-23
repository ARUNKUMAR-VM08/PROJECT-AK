import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split Firebase SDK
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // Split Framer Motion for smooth animations
            if (id.includes('framer-motion')) {
              return 'vendor-framer-motion';
            }
            // Split Lucide Icons
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            // Split core React libraries
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react-core';
            }
            // All other third-party libraries (e.g. react-toastify)
            return 'vendor-helpers';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Elevated limit as custom chunks are managed
  }
})
