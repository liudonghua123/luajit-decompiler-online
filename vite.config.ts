import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const base = process.env.VITE_BASE_URL || '/'

export default defineConfig({
  base,
  build: {
    sourcemap: true
  },
  plugins: [
    vue()
  ],
  optimizeDeps: {
    exclude: ['@wasmer/sdk']
  }
})