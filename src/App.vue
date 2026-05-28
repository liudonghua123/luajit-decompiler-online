<script setup lang="ts">
import { ref, computed } from 'vue'
import FolderTree from './components/FolderTree.vue'
import CodeViewer from './components/CodeViewer.vue'
import DropZone from './components/DropZone.vue'
import StatusBar from './components/StatusBar.vue'
import FilePreview from './components/FilePreview.vue'
import { useFileSystem } from './composables/useFileSystem'
import { useWasmDecompiler } from './composables/useWasmDecompiler'
import { detectFileType, type FileCategory } from './utils/fileTypeDetector'

const { fileTree, projectName, isSupported, selectFolder, handleDrop, readFile, clearProject, getFileInfo } = useFileSystem()
const { isLoading: wasmLoading, error: wasmError, decompile } = useWasmDecompiler()

const selectedPath = ref<string | null>(null)
const currentCode = ref('')
const currentLanguage = ref('lua')
const currentFileName = ref('')

// File preview state
const currentBuffer = ref<ArrayBuffer | null>(null)
const currentFileType = ref<{ category: FileCategory; mimeType: string; description: string } | null>(null)
const fileSize = ref(0)
const fileEncoding = ref('')
const modifiedTime = ref('')
const lineCount = ref(0)
const decompileStatus = ref<'success' | 'error' | 'pending' | undefined>(undefined)

const hasProject = computed(() => fileTree.value.length > 0)
const isLuaFile = computed(() => currentFileType.value?.category === 'lua')

async function onSelect(path: string, handle: FileSystemFileHandle) {
  selectedPath.value = path
  currentFileName.value = path.split('/').pop() || ''
  currentCode.value = ''
  lineCount.value = 0
  decompileStatus.value = 'pending'

  const buffer = await readFile(handle)
  if (!buffer) {
    currentCode.value = 'Failed to read file'
    decompileStatus.value = 'error'
    return
  }

  currentBuffer.value = buffer
  fileSize.value = buffer.byteLength

  // Detect file type
  currentFileType.value = detectFileType(buffer, currentFileName.value)

  // Get file info
  const fileInfo = await getFileInfo(handle)
  if (fileInfo) {
    fileEncoding.value = fileInfo.encoding
    modifiedTime.value = fileInfo.modified?.toLocaleString() || ''
  }

  // Handle based on file type
  if (currentFileType.value.category === 'lua') {
    // Try to decompile
    const result = await decompile(buffer)
    if (result.success) {
      currentCode.value = result.output
      currentLanguage.value = 'lua'
      lineCount.value = result.output.split('\n').length
      decompileStatus.value = 'success'
    } else {
      // If decompile fails, show as text (might be lua source)
      currentCode.value = new TextDecoder().decode(buffer)
      currentLanguage.value = 'lua'
      lineCount.value = currentCode.value.split('\n').length
      decompileStatus.value = 'error'
    }
  } else {
    // Non-Lua files will be handled by FilePreview component
    decompileStatus.value = undefined
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
  <div class="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
    <!-- Top Toolbar - Glass Effect -->
    <header class="glass border-b border-white/20 z-50">
      <div class="flex items-center justify-between px-6 py-4">
        <!-- Left: Logo & Title -->
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            LJ
          </div>
          <div>
            <h1 class="text-xl font-bold gradient-text">LuaJIT Decompiler</h1>
            <p v-if="projectName" class="text-xs text-gray-500">{{ projectName }}</p>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-3">
          <span v-if="wasmLoading" class="text-sm text-purple-600 animate-pulse">
            ⏳ Loading WASM...
          </span>
          <button
            v-if="isSupported"
            class="btn-gradient px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-purple-500/25"
            @click="openFolder"
          >
            📁 打开文件夹
          </button>
          <button
            v-if="hasProject"
            class="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
            @click="clearProject"
          >
            ✕ 清除
          </button>
        </div>
      </div>
    </header>

    <!-- Error Banner -->
    <div v-if="wasmError" class="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
      ⚠️ {{ wasmError }}
    </div>

    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Left Sidebar - File Tree -->
      <aside v-if="hasProject" class="w-72 flex-shrink-0 flex flex-col">
        <FolderTree :tree="fileTree" :selected-path="selectedPath" @select="onSelect" />
      </aside>

      <!-- Right Panel - Content Area -->
      <section class="flex-1 flex flex-col overflow-hidden">
        <!-- Drop Zone (no project) -->
        <DropZone v-if="!hasProject" @drop="onDrop" />

        <!-- File Content -->
        <template v-else>
          <!-- File Tab Bar -->
          <div v-if="currentFileName" class="glass px-4 py-2 border-b border-white/20 flex items-center gap-2 flex-shrink-0">
            <span class="text-sm font-medium text-gray-700">{{ currentFileName }}</span>
            <span v-if="currentFileType" class="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
              {{ currentFileType.description }}
            </span>
          </div>

          <!-- Content Viewer -->
          <div class="flex-1 overflow-hidden">
            <!-- Code Viewer (Lua files) -->
            <CodeViewer
              v-if="isLuaFile && currentCode"
              :code="currentCode"
              :language="currentLanguage"
            />

            <!-- File Preview (Non-Lua files) -->
            <FilePreview
              v-else-if="currentBuffer && currentFileType && currentFileType.category !== 'lua'"
              :buffer="currentBuffer"
              :file-name="currentFileName"
              :mime-type="currentFileType.mimeType"
              :description="currentFileType.description"
            />

            <!-- Empty State -->
            <div v-else-if="!currentFileName" class="h-full flex items-center justify-center text-gray-400">
              <div class="text-center">
                <div class="text-5xl mb-4" aria-hidden="true">👈</div>
                <p class="text-lg">从左侧选择一个文件开始</p>
              </div>
            </div>
          </div>
        </template>
      </section>
    </main>

    <!-- Status Bar -->
    <StatusBar
      :file-name="currentFileName"
      :file-path="selectedPath || ''"
      :file-size="fileSize"
      :file-type="currentFileType?.description || ''"
      :encoding="fileEncoding"
      :modified-time="modifiedTime"
      :decompile-status="decompileStatus"
      :line-count="lineCount"
    />
  </div>
</template>