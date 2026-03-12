import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    sourcemap: 'hidden', // Generated for Sentry upload, NOT shipped to browser
    chunkSizeWarningLimit: 1500, // Increased to account for three.js (1.1MB)
    cssCodeSplit: true,
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production only
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'animations': ['framer-motion'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'socket': ['socket.io-client'],
          'ui-utils': ['axios', 'react-hot-toast', 'lucide-react']
        }
      }
    }
  },
  server: {
    host:true,
    port: 5173,
    hmr: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true
      }
    }
  }
})
