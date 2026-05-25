<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps<{
  code: string
  language: string
  readOnly?: boolean
}>()

const editorContainer = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

onMounted(() => {
  if (editorContainer.value) {
    editor = monaco.editor.create(editorContainer.value, {
      value: props.code,
      language: props.language,
      theme: 'vs-dark',
      readOnly: props.readOnly ?? true,
      automaticLayout: true,
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: 'on'
    })
  }
})

onUnmounted(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
})

watch(() => props.code, (newCode) => {
  if (editor) {
    editor.setValue(newCode)
  }
})

watch(() => props.language, (newLang) => {
  if (editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, newLang)
    }
  }
})
</script>

<template>
  <div ref="editorContainer" class="h-full w-full"></div>
</template>