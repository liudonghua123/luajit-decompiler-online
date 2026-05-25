# LuaJIT Decompiler Online Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pure web app for decompiling LuaJIT bytecode files with folder selection, tree view, and Monaco Editor.

**Architecture:** Vue 3 SPA with Composition API, split-panel layout (folder tree + Monaco Editor), WASM decompiler loaded client-side via Vite.

**Tech Stack:** Vite 5.x, Vue 3, Tailwind CSS 3.x, Monaco Editor (vite-plugin-monaco-editor)

---

## File Structure

```
/
├── public/
│   └── luajit-decompiler-v2-wasi.wasm  (copied)
├── src/
│   ├── components/
│   │   ├── FolderTree.vue
│   │   ├── FileNode.vue
│   │   ├── CodeViewer.vue
│   │   └── DropZone.vue
│   ├── composables/
│   │   ├── useFileSystem.ts
│   │   └── useWasmDecompiler.ts
│   ├── utils/
│   │   └── buildFileTree.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── tsconfig.json
└── .github/workflows/deploy.yml
```

---

## Tasks

### Task 1: Initialize Vite + Vue 3 Project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `src/main.ts`
- Create: `src/style.css`
- Create: `src/App.vue`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "luajit-decompiler-online",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.4.0",
    "vite-plugin-monaco-editor": "^1.1.0",
    "vue-tsc": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig({
  plugins: [
    vue(),
    (monacoEditorPlugin as any).default({
      languageWorkers: ['editorWorkerService', 'typescript', 'json', 'css'],
      customWorkers: []
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor']
        }
      }
    }
  }
})
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LuaJIT Decompiler Online</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Create tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 7: Create postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 8: Create src/main.ts**

```typescript
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
```

- [ ] **Step 9: Create src/style.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 10: Create src/App.vue**

```vue
<script setup lang="ts">
// Placeholder - will be implemented in Task 7
</script>

<template>
  <div class="h-screen bg-gray-100">
    <h1 class="text-2xl font-bold p-4">LuaJIT Decompiler Online</h1>
    <p class="p-4">Loading...</p>
  </div>
</template>
```

- [ ] **Step 11: Create src/vite-env.d.ts**

```typescript
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

- [ ] **Step 12: Install dependencies and verify dev server**

Run: `cd /c/Users/admin/code/ai/luajit-decompiler-online && npm install`
Expected: Dependencies installed successfully

Run: `npm run dev -- --host 0.0.0.0 --port 5173`
Expected: Vite dev server starts

---

### Task 2: Copy WASM File to Public

**Files:**
- Copy: `luajit-decompiler-v2-wasi.wasm` → `public/`

- [ ] **Step 1: Copy WASM file**

Run: `cp luajit-decompiler-v2-wasi.wasm public/`
Run: `ls -la public/`
Expected: luajit-decompiler-v2-wasi.wasm exists in public/

---

### Task 3: Define Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Create types file**

```typescript
export interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
  handle?: FileSystemDirectoryHandle | FileSystemFileHandle
}

export interface DecompileResult {
  success: boolean
  output: string
  error?: string
}
```

---

### Task 4: Create File Tree Utilities

**Files:**
- Create: `src/utils/buildFileTree.ts`

- [ ] **Step 1: Create buildFileTree utility**

```typescript
import type { FileNode } from '../types'

export async function buildFileTree(
  dirHandle: FileSystemDirectoryHandle,
  path = ''
): Promise<FileNode[]> {
  const nodes: FileNode[] = []

  for await (const entry of dirHandle.values()) {
    const entryPath = path ? `${path}/${entry.name}` : entry.name

    if (entry.kind === 'directory') {
      const subHandle = await dirHandle.getDirectoryHandle(entry.name)
      const children = await buildFileTree(subHandle, entryPath)
      nodes.push({
        name: entry.name,
        path: entryPath,
        isDirectory: true,
        children,
        handle: subHandle
      })
    } else {
      nodes.push({
        name: entry.name,
        path: entryPath,
        isDirectory: false,
        handle: entry
      })
    }
  }

  // Sort: directories first, then alphabetically
  return nodes.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1
    if (!a.isDirectory && b.isDirectory) return 1
    return a.name.localeCompare(b.name)
  })
}

export async function findFileInTree(
  nodes: FileNode[],
  path: string
): Promise<FileNode | null> {
  for (const node of nodes) {
    if (node.path === path) return node
    if (node.children) {
      const found = await findFileInTree(node.children, path)
      if (found) return found
    }
  }
  return null
}
```

---

### Task 5: Create WASM Decompiler Composable

**Files:**
- Create: `src/composables/useWasmDecompiler.ts`

- [ ] **Step 1: Create useWasmDecompiler composable**

```typescript
import { ref } from 'vue'
import type { DecompileResult } from '../types'

export function useWasmDecompiler() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  let wasmModule: any = null

  async function initWasm() {
    if (wasmModule) return

    isLoading.value = true
    error.value = null

    try {
      // Dynamic import with import-wasm or manual instantiation
      const { default: init, instance } = await WebAssembly.instantiateStreaming(
        fetch('/luajit-decompiler-v2-wasi.wasm')
      )
      await init(instance)
      wasmModule = instance
    } catch (e) {
      error.value = `Failed to load WASM: ${e}`
      console.error('WASM load error:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function decompile(buffer: ArrayBuffer): Promise<DecompileResult> {
    if (!wasmModule) {
      await initWasm()
    }

    if (!wasmModule) {
      return { success: false, output: '', error: 'WASM not loaded' }
    }

    try {
      // Call WASM exports - adjust based on actual WASM API
      const memory = wasmModule.exports.memory
      const decompile = wasmModule.exports.decompile

      if (!decompile) {
        return { success: false, output: '', error: 'decompile export not found' }
      }

      // Allocate buffer in WASM memory
      const input = new Uint8Array(buffer)
      const ptr = decompile(input.length)

      // Copy input to WASM memory
      const mem = new Uint8Array(memory.buffer)
      mem.set(input, ptr)

      // Call decompile with pointer and length
      const resultPtr = decompile(ptr, input.length)

      // Read result string from memory (null-terminated)
      let end = resultPtr
      while (mem[end] !== 0) end++
      const result = new TextDecoder().decode(mem.slice(resultPtr, end))

      return { success: true, output: result }
    } catch (e) {
      return { success: false, output: '', error: String(e) }
    }
  }

  return {
    isLoading,
    error,
    initWasm,
    decompile
  }
}
```

**Note:** The WASM API may need adjustment based on the actual luajit-decompiler-v2-wasi.wasm exports. The user should verify the exports after initial implementation.

---

### Task 6: Create File System Composable

**Files:**
- Create: `src/composables/useFileSystem.ts`

- [ ] **Step 1: Create useFileSystem composable**

```typescript
import { ref } from 'vue'
import type { FileNode } from '../types'
import { buildFileTree } from '../utils/buildFileTree'

export function useFileSystem() {
  const rootHandle = ref<FileSystemDirectoryHandle | null>(null)
  const fileTree = ref<FileNode[]>([])
  const projectName = ref('')

  const isSupported = 'showDirectoryPicker' in window

  async function selectFolder(): Promise<boolean> {
    try {
      rootHandle.value = await (window as any).showDirectoryPicker()
      projectName.value = rootHandle.value.name
      fileTree.value = await buildFileTree(rootHandle.value)
      return true
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.error('Failed to select folder:', e)
      }
      return false
    }
  }

  async function handleDrop(dataTransfer: DataTransfer): Promise<boolean> {
    const item = dataTransfer.items[0]
    if (!item) return false

    try {
      const handle = await (item as any).getAsFileSystemHandle()
      if (handle && handle.kind === 'directory') {
        rootHandle.value = handle
        projectName.value = handle.name
        fileTree.value = await buildFileTree(handle)
        return true
      }
    } catch (e) {
      console.error('Failed to handle drop:', e)
    }
    return false
  }

  async function readFile(
    fileHandle: FileSystemFileHandle
  ): Promise<ArrayBuffer | null> {
    try {
      const file = await fileHandle.getFile()
      return await file.arrayBuffer()
    } catch (e) {
      console.error('Failed to read file:', e)
      return null
    }
  }

  function clearProject() {
    rootHandle.value = null
    fileTree.value = []
    projectName.value = ''
  }

  return {
    rootHandle,
    fileTree,
    projectName,
    isSupported,
    selectFolder,
    handleDrop,
    readFile,
    clearProject
  }
}
```

---

### Task 7: Build FolderTree Components

**Files:**
- Create: `src/components/FileNode.vue`
- Create: `src/components/FolderTree.vue`

- [ ] **Step 1: Create FileNode.vue**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FileNode } from '../types'
import { findFileInTree } from '../utils/buildFileTree'

const props = defineProps<{
  node: FileNode
  depth: number
  selectedPath: string | null
}>()

const emit = defineEmits<{
  (e: 'select', path: string, handle: FileSystemFileHandle): void
}>()

const isExpanded = ref(props.depth === 0)

const paddingLeft = computed(() => `${props.depth * 16 + 12}px`)
const isLua = computed(() => /\.(lua|luac)$/i.test(props.node.name))
const icon = computed(() => {
  if (props.node.isDirectory) return isExpanded.value ? '📂' : '📁'
  if (isLua.value) return '📄'
  return '📋'
})

function toggle() {
  if (props.node.isDirectory) {
    isExpanded.value = !isExpanded.value
  }
}

function select() {
  if (!props.node.isDirectory && props.node.handle) {
    emit('select', props.node.path, props.node.handle as FileSystemFileHandle)
  }
}
</script>

<template>
  <div>
    <div
      class="flex items-center py-1 px-2 hover:bg-gray-200 cursor-pointer select-none"
      :style="{ paddingLeft }"
      @click="toggle"
      @dblclick="select"
    >
      <span class="mr-2">{{ icon }}</span>
      <span class="truncate">{{ node.name }}</span>
    </div>
    <div v-if="isExpanded && node.children">
      <FileNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :depth="depth + 1"
        :selected-path="selectedPath"
        @select="(p, h) => emit('select', p, h)"
      />
    </div>
  </div>
</template>
```

- [ ] **Step 2: Create FolderTree.vue**

```vue
<script setup lang="ts">
import FileNode from './FileNode.vue'
import type { FileNode as FileNodeType, FileSystemFileHandle } from '../types'

defineProps<{
  tree: FileNodeType[]
  selectedPath: string | null
}>()

const emit = defineEmits<{
  (e: 'select', path: string, handle: FileSystemFileHandle): void
}>()
</script>

<template>
  <div class="h-full overflow-auto bg-white border-r border-gray-300">
    <div v-if="tree.length === 0" class="p-4 text-gray-500">
      Select a folder or drag and drop to begin
    </div>
    <FileNode
      v-for="node in tree"
      :key="node.path"
      :node="node"
      :depth="0"
      :selected-path="selectedPath"
      @select="(p, h) => emit('select', p, h)"
    />
  </div>
</template>
```

---

### Task 8: Build CodeViewer Component

**Files:**
- Create: `src/components/CodeViewer.vue`

- [ ] **Step 1: Create CodeViewer.vue**

```vue
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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

watch(() => props.code, (newCode) => {
  if (editor) {
    editor.setValue(newCode)
  }
})

watch(() => props.language, (newLang) => {
  if (editor) {
    monaco.editor.setModelLanguage(editor.getModel()!, newLang)
  }
})
</script>

<template>
  <div ref="editorContainer" class="h-full w-full"></div>
</template>
```

---

### Task 9: Build DropZone Component

**Files:**
- Create: `src/components/DropZone.vue`

- [ ] **Step 1: Create DropZone.vue**

```vue
<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'drop', dataTransfer: DataTransfer): void
}>()

const isDragging = ref(false)

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer) {
    emit('drop', e.dataTransfer)
  }
}
</script>

<template>
  <div
    class="h-full flex items-center justify-center"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div
      v-if="isDragging"
      class="border-4 border-dashed border-blue-500 rounded-xl p-8 text-center bg-blue-50"
    >
      <p class="text-xl text-blue-600 font-semibold">Drop folder here</p>
    </div>
  </div>
</template>
```

---

### Task 10: Build Main App Layout

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: Update App.vue with full layout**

```vue
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
        <h1 class="text-lg font-semibold">LuaJIT Decompiler</h1>
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
```

---

### Task 11: Create GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create GitHub Actions workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Copy WASM file
        run: cp luajit-decompiler-v2-wasi.wasm public/

      - name: Build
        run: npm run build
        env:
          NODE_ENV: production

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit workflow**

```bash
mkdir -p .github/workflows
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deployment workflow

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 12: Final Verification and Deployment

- [ ] **Step 1: Test dev server**

Run: `npm run dev -- --host 0.0.0.0 --port 5173`
Expected: Dev server starts, page loads without errors

- [ ] **Step 2: Test build**

Run: `npm run build`
Expected: Build completes without errors

- [ ] **Step 3: Verify WASM file is included**

Run: `ls -la dist/`
Expected: WASM file present in dist/

- [ ] **Step 4: Commit all remaining changes**

```bash
git add .
git commit -m "feat: complete luajit-decompiler-online implementation

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

- [ ] **Step 5: Push to remote**

Run: `git push origin main`
Expected: Pushed successfully, GitHub Actions should trigger

---

## Post-Implementation Notes

1. **WASM API**: The `useWasmDecompiler.ts` composable assumes specific WASM exports. Verify the actual exports with:
   ```javascript
   const response = await fetch('/luajit-decompiler-v2-wasi.wasm')
   const { instance } = await WebAssembly.instantiateStreaming(response)
   console.log(Object.keys(instance.exports))
   ```

2. **File System Access API**: This API only works in Chromium-based browsers. For Firefox/Safari, add a fallback using drag-and-drop file reading (already partially implemented).

3. **CORS**: When running locally with `file://` protocol, WASM streaming may fail. Use the dev server (`npm run dev`) for local testing.