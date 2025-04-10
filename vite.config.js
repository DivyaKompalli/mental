import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    include: ['vue-toastification', 'howler'],
    // include: ['vuex'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // Allow external access
    port: 5174, // Explicit port
  },
  define: {
    'process.env': {},
  },
})
