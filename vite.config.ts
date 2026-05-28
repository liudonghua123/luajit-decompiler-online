import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig({
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
})