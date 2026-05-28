import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.VITE_BASE_URL ? `/${env.VITE_BASE_URL.replace(/^\//, '')}` : '/',
    build: {
      sourcemap: true
    },
    plugins: [
      vue(),
      monacoEditorPlugin.default({
        languageWorkers: ['editorWorkerService']
      })
    ],
    optimizeDeps: {
      exclude: ['@wasmer/sdk']
    }
  }
})