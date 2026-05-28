<script setup lang="ts">
import { ref, computed } from 'vue'
import FolderTree from './components/FolderTree.vue'
import CodeViewer from './components/CodeViewer.vue'
import DropZone from './components/DropZone.vue'
import { useFileSystem } from './composables/useFileSystem'
import { useWasmDecompiler } from './composables/useWasmDecompiler'

const { fileTree, projectName, isSupported, selectFolder, handleDrop, readFile, clearProject } = useFileSystem()
const { isLoading: wasmLoading, error: wasmError, decompile } = useWasmDecompiler()

const selectedPath = ref<string | null>(null)
const currentCode = ref('')
const currentLanguage = ref('lua')
const currentFileName = ref('')
const hasProject = computed(() => fileTree.value.length > 0)

async function onSelect(path: string, handle: FileSystemFileHandle) {
  selectedPath.value = path
  currentFileName.value = path.split('/').pop() || ''

  const buffer = await readFile(handle)
  if (!buffer) {
    currentCode.value = 'Failed to read file'
    return
  }

  const result = await decompile(buffer)
  if (result.success) {
    currentCode.value = result.output
    currentLanguage.value = 'lua'
  } else {
    currentCode.value = `-- Decompile error: ${result.error}\n-- Raw content:\n\n${new TextDecoder().decode(buffer)}`
    currentLanguage.value = 'lua'
  }
}

async function onDrop(dataTransfer: DataTransfer) {
  await handleDrop(dataTransfer)
}

async function openFolder() {
  await selectFolder()
}
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-100">
    <!-- Toolbar -->
    <div class="flex items-center justify-between px-4 py-3 bg-gray-800 text-white">
      <div class="flex items-center gap-4">
        <h1 class="text-lg font-semibold">LuaJIT Decompiler V2</h1>
        <span v-if="projectName" class="text-gray-400">| {{ projectName }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="wasmLoading" class="text-sm text-yellow-400">Loading WASM...</span>
        <button
          v-if="isSupported"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
          @click="openFolder"
        >
          Open Folder
        </button>
        <button
          v-if="hasProject"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm font-medium"
          @click="clearProject"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Error banner -->
    <div v-if="wasmError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-2">
      {{ wasmError }}
    </div>

    <!-- Main content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left panel - File tree -->
      <div v-if="hasProject" class="w-72 flex-shrink-0">
        <FolderTree :tree="fileTree" :selected-path="selectedPath" @select="onSelect" />
      </div>

      <!-- Right panel - Code viewer -->
      <div class="flex-1 flex flex-col">
        <DropZone v-if="!hasProject" @drop="onDrop" />

        <template v-else>
          <div v-if="currentFileName" class="px-4 py-2 bg-gray-200 text-sm font-medium">
            {{ currentFileName }}
          </div>
          <div class="flex-1">
            <CodeViewer
              v-if="currentCode"
              :code="currentCode"
              :language="currentLanguage"
            />
            <div v-else class="h-full flex items-center justify-center text-gray-500">
              Click a file to decompile
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
