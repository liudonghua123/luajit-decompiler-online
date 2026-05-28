# LuaJIT Decompiler UI 2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 现代化改造 LuaJIT 反编译器界面，采用 macOS Sonoma 设计风格

**Architecture:** 基于 Vue 3 + TypeScript + Tailwind CSS，使用毛玻璃效果、圆角卡片、响应式布局。文件类型通过 magic bytes 智能识别。

**Tech Stack:** Vue 3, TypeScript, Tailwind CSS, Monaco Editor, File System Access API

---

## 文件结构

```
src/
├── App.vue                              # 主布局、状态管理
├── style.css                            # 毛玻璃样式、全局样式
├── components/
│   ├── DropZone.vue                     # 拖拽引导页面（重写）
│   ├── FolderTree.vue                   # 侧边栏毛玻璃化
│   ├── FileNode.vue                     # 文件图标、选中高亮
│   ├── StatusBar.vue                    # [新建] 可展开状态栏
│   ├── CodeViewer.vue                   # 代码查看器
│   ├── FilePreview.vue                  # [新建] 非代码文件预览
│   └── MediaPlayer.vue                  # [新建] 音视频播放器
├── composables/
│   ├── useFileSystem.ts                 # 文件系统操作（扩展）
│   └── useFileInfo.ts                   # [新建] 文件信息获取
└── utils/
    ├── buildFileTree.ts                 # 文件树构建（不变）
    └── fileTypeDetector.ts              # [新建] Magic bytes 检测
```

---

## Task 1: 基础样式配置

**Files:**
- Modify: `src/style.css`

- [ ] **Step 1: 添加毛玻璃和 macOS 样式变量**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* macOS Sonoma Glass Effect */
.glass {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-dark {
  background: rgba(30, 30, 30, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Gradient Text */
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Gradient Button */
.btn-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  transition: all 0.3s ease;
}

.btn-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

/* Custom Scrollbar - macOS Style */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Smooth transitions */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

- [ ] **Step 2: 提交**

```bash
git add src/style.css
git commit -m "style: add glassmorphism and macOS styles"
```

---

## Task 2: 文件类型检测工具

**Files:**
- Create: `src/utils/fileTypeDetector.ts`

- [ ] **Step 1: 编写 magic bytes 检测工具**

```typescript
export type FileCategory = 'lua' | 'text' | 'audio' | 'video' | 'image' | 'binary'

export interface FileTypeResult {
  category: FileCategory
  mimeType: string
  description: string
}

const MAGIC_BYTES: Array<{ bytes: number[]; mask?: number[]; category: FileCategory; mimeType: string; description: string }> = [
  // Lua Bytecode (ESC + "Lua")
  { bytes: [0x1b, 0x4c, 0x75, 0x61], category: 'lua', mimeType: 'application/x-luac', description: 'Lua Bytecode' },
  // JPEG
  { bytes: [0xff, 0xd8, 0xff], category: 'image', mimeType: 'image/jpeg', description: 'JPEG Image' },
  // PNG
  { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], category: 'image', mimeType: 'image/png', description: 'PNG Image' },
  // GIF
  { bytes: [0x47, 0x49, 0x46, 0x38], category: 'image', mimeType: 'image/gif', description: 'GIF Image' },
  // WebP
  { bytes: [0x52, 0x49, 0x46, 0x46], mask: [0xff, 0xff, 0xff, 0xff], category: 'image', mimeType: 'image/webp', description: 'WebP Image' },
  // MP3 (ID3)
  { bytes: [0x49, 0x44, 0x33], category: 'audio', mimeType: 'audio/mpeg', description: 'MP3 Audio' },
  // MP3 (no ID3)
  { bytes: [0xff, 0xfb], category: 'audio', mimeType: 'audio/mpeg', description: 'MP3 Audio' },
  // WAV
  { bytes: [0x52, 0x49, 0x46, 0x46], mask: [0xff, 0xff, 0xff, 0xff], category: 'audio', mimeType: 'audio/wav', description: 'WAV Audio' },
  // FLAC
  { bytes: [0x66, 0x4c, 0x61, 0x43], category: 'audio', mimeType: 'audio/flac', description: 'FLAC Audio' },
  // MP4
  { bytes: [0x00, 0x00, 0x00], category: 'video', mimeType: 'video/mp4', description: 'MP4 Video' },
  // AVI
  { bytes: [0x52, 0x49, 0x46, 0x46], mask: [0xff, 0xff, 0xff, 0xff], category: 'video', mimeType: 'video/x-msvideo', description: 'AVI Video' },
  // WebM
  { bytes: [0x1a, 0x45, 0xdf, 0xa3], category: 'video', mimeType: 'video/webm', description: 'WebM Video' },
]

export function detectFileType(buffer: ArrayBuffer, filename: string): FileTypeResult {
  const ext = filename.toLowerCase().split('.').pop() || ''

  // Check by extension first
  if (ext === 'lua' || ext === 'luac') {
    const data = new Uint8Array(buffer)
    // Check magic bytes for luac
    if (ext === 'luac' || (data.length >= 4 && data[0] === 0x1b && data[1] === 0x4c && data[2] === 0x75 && data[3] === 0x61)) {
      return { category: 'lua', mimeType: 'application/x-luac', description: 'Lua Bytecode' }
    }
    return { category: 'lua', mimeType: 'text/x-lua', description: 'Lua Source' }
  }

  // Check magic bytes
  const data = new Uint8Array(buffer.slice(0, 16))

  for (const magic of MAGIC_BYTES) {
    const matches = magic.bytes.every((byte, i) => {
      const mask = magic.mask?.[i] ?? 0xff
      return (data[i] & mask) === (byte & mask)
    })
    if (matches) {
      return { category: magic.category, mimeType: magic.mimeType, description: magic.description }
    }
  }

  // Check if it's readable as text (UTF-8 or ASCII)
  let isText = true
  let nullCount = 0
  for (let i = 0; i < Math.min(data.length, 512); i++) {
    if (data[i] === 0) {
      nullCount++
      if (nullCount > 2) {
        isText = false
        break
      }
    }
    if (data[i] < 32 && data[i] !== 9 && data[i] !== 10 && data[i] !== 13) {
      isText = false
      break
    }
  }

  if (isText) {
    return { category: 'text', mimeType: 'text/plain', description: 'Text File' }
  }

  return { category: 'binary', mimeType: 'application/octet-stream', description: 'Binary File' }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
```

- [ ] **Step 2: 提交**

```bash
git add src/utils/fileTypeDetector.ts
git commit -m "feat: add file type detection via magic bytes"
```

---

## Task 3: 可展开状态栏组件

**Files:**
- Create: `src/components/StatusBar.vue`

- [ ] **Step 1: 编写状态栏组件**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  fileName: string
  filePath: string
  fileSize: number
  fileType: string
  encoding: string
  modifiedTime?: string
  decompileStatus?: 'success' | 'error' | 'pending'
  lineCount?: number
}>()

const isExpanded = ref(false)

const sizeFormatted = computed(() => {
  if (props.fileSize === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(props.fileSize) / Math.log(k))
  return parseFloat((props.fileSize / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
})

const statusIcon = computed(() => {
  switch (props.decompileStatus) {
    case 'success': return '✅'
    case 'error': return '❌'
    default: return '⏳'
  }
})

const statusText = computed(() => {
  switch (props.decompileStatus) {
    case 'success': return `成功 · ${props.lineCount || 0} lines`
    case 'error': return '反编译失败'
    default: return '等待反编译'
  }
})

function toggle() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="glass border-t border-white/20">
    <!-- Collapsed View -->
    <div
      class="h-10 px-4 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors"
      @click="toggle"
    >
      <div class="flex items-center gap-3 text-sm">
        <span class="opacity-70">📄</span>
        <span class="font-medium">{{ fileName || 'No file selected' }}</span>
        <span v-if="fileName" class="text-gray-500">·</span>
        <span v-if="fileName" class="text-gray-500">{{ sizeFormatted }}</span>
        <span v-if="fileName" class="text-gray-500">·</span>
        <span v-if="fileName" class="text-gray-500">{{ fileType }}</span>
        <span v-if="fileName && modifiedTime" class="text-gray-500">·</span>
        <span v-if="fileName && modifiedTime" class="text-gray-500">修改于 {{ modifiedTime }}</span>
      </div>
      <div class="flex items-center gap-4">
        <span v-if="decompileStatus" class="text-sm">
          {{ statusIcon }} {{ statusText }}
        </span>
        <span class="text-gray-400 transform transition-transform" :class="{ 'rotate-180': isExpanded }">
          ▼
        </span>
      </div>
    </div>

    <!-- Expanded View -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-48"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-48"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="isExpanded" class="overflow-hidden border-t border-white/10">
        <div class="p-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">文件名:</span>
            <span class="font-medium">{{ fileName || '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">大小:</span>
            <span>{{ sizeFormatted }}</span>
          </div>
          <div class="flex justify-between col-span-2">
            <span class="text-gray-500">路径:</span>
            <span class="font-mono text-xs truncate max-w-md">{{ filePath || '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">类型:</span>
            <span>{{ fileType || '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">编码:</span>
            <span>{{ encoding || '-' }}</span>
          </div>
          <div v-if="modifiedTime" class="flex justify-between">
            <span class="text-gray-500">修改时间:</span>
            <span>{{ modifiedTime }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">行数:</span>
            <span>{{ lineCount || '-' }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/StatusBar.vue
git commit -m "feat: add expandable status bar component"
```

---

## Task 4: 音视频播放器组件

**Files:**
- Create: `src/components/MediaPlayer.vue`

- [ ] **Step 1: 编写媒体播放器组件**

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  url: string
  mimeType: string
  fileName: string
}>()

const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const playbackRate = ref(1)
const isLoaded = ref(false)

const isAudio = computed(() => props.mimeType.startsWith('audio/'))
const isVideo = computed(() => props.mimeType.startsWith('video/'))

const progress = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

function togglePlay() {
  const media = document.querySelector('audio, video') as HTMLMediaElement
  if (!media) return

  if (isPlaying.value) {
    media.pause()
  } else {
    media.play()
  }
  isPlaying.value = !isPlaying.value
}

function onTimeUpdate(e: Event) {
  const media = e.target as HTMLMediaElement
  currentTime.value = media.currentTime
}

function onLoadedMetadata(e: Event) {
  const media = e.target as HTMLMediaElement
  duration.value = media.duration
  isLoaded.value = true
}

function seek(e: MouseEvent) {
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  const media = document.querySelector('audio, video') as HTMLMediaElement
  if (media) {
    media.currentTime = percent * duration.value
  }
}

function changeVolume(e: Event) {
  const input = e.target as HTMLInputElement
  volume.value = parseFloat(input.value)
  const media = document.querySelector('audio, video') as HTMLMediaElement
  if (media) {
    media.volume = volume.value
  }
}

function changeRate(rate: number) {
  playbackRate.value = rate
  const media = document.querySelector('audio, video') as HTMLMediaElement
  if (media) {
    media.playbackRate = rate
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="glass rounded-2xl p-6 max-w-2xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4">
      <span class="text-2xl">{{ isVideo ? '🎬' : '🎵' }}</span>
      <div>
        <h3 class="font-semibold">{{ fileName }}</h3>
        <p class="text-sm text-gray-500">{{ mimeType }}</p>
      </div>
    </div>

    <!-- Media Element -->
    <div class="relative rounded-xl overflow-hidden bg-black/10 mb-4">
      <video
        v-if="isVideo"
        :src="url"
        class="w-full max-h-80 mx-auto"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @play="isPlaying = true"
        @pause="isPlaying = false"
      />
      <audio
        v-if="isAudio"
        :src="url"
        class="w-full"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @play="isPlaying = true"
        @pause="isPlaying = false"
      />

      <!-- Audio Visualizer Placeholder -->
      <div v-if="isAudio && isLoaded" class="h-20 flex items-center justify-center gap-1">
        <div v-for="i in 20" :key="i" class="w-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full animate-pulse" :style="{ height: `${20 + Math.random() * 40}px`, animationDelay: `${i * 0.05}s` }"></div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div
      class="h-2 bg-gray-200 rounded-full cursor-pointer mb-4 overflow-hidden"
      @click="seek"
    >
      <div
        class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
        :style="{ width: `${progress}%` }"
      />
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <!-- Play/Pause -->
        <button
          class="w-12 h-12 rounded-full btn-gradient flex items-center justify-center text-xl"
          @click="togglePlay"
        >
          {{ isPlaying ? '⏸' : '▶️' }}
        </button>

        <!-- Time -->
        <span class="text-sm text-gray-500 font-mono">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </span>
      </div>

      <div class="flex items-center gap-4">
        <!-- Volume -->
        <div class="flex items-center gap-2">
          <span>{{ volume > 0 ? '🔊' : '🔇' }}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            :value="volume"
            class="w-20 accent-purple-500"
            @input="changeVolume"
          />
        </div>

        <!-- Speed -->
        <div class="flex items-center gap-1">
          <span class="text-sm text-gray-500">{{ playbackRate }}x</span>
          <button
            v-for="rate in [0.5, 1, 1.5, 2]"
            :key="rate"
            class="px-2 py-1 text-xs rounded"
            :class="playbackRate === rate ? 'bg-purple-500 text-white' : 'bg-gray-200 hover:bg-gray-300'"
            @click="changeRate(rate)"
          >
            {{ rate }}x
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/MediaPlayer.vue
git commit -m "feat: add media player component"
```

---

## Task 5: 文件预览组件

**Files:**
- Create: `src/components/FilePreview.vue`

- [ ] **Step 1: 编写文件预览组件**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import MediaPlayer from './MediaPlayer.vue'
import CodeViewer from './CodeViewer.vue'

const props = defineProps<{
  buffer: ArrayBuffer
  fileName: string
  mimeType: string
  description: string
}>()

const imageUrl = computed(() => {
  const blob = new Blob([props.buffer], { type: props.mimeType })
  return URL.createObjectURL(blob)
})

const mediaUrl = computed(() => {
  const blob = new Blob([props.buffer], { type: props.mimeType })
  return URL.createObjectURL(blob)
})

const textContent = computed(() => {
  try {
    const decoder = new TextDecoder('utf-8', { fatal: false })
    return decoder.decode(props.buffer)
  } catch {
    return 'Unable to decode text content'
  }
})
</script>

<template>
  <div class="h-full flex items-center justify-center p-8 overflow-auto">
    <!-- Image Preview -->
    <template v-if="mimeType.startsWith('image/')">
      <div class="glass rounded-2xl p-4 max-w-full">
        <img
          :src="imageUrl"
          :alt="fileName"
          class="max-w-full max-h-[60vh] rounded-lg shadow-lg"
        />
        <p class="text-center text-sm text-gray-500 mt-2">{{ description }}</p>
      </div>
    </template>

    <!-- Audio/Video Preview -->
    <template v-else-if="mimeType.startsWith('audio/') || mimeType.startsWith('video/')">
      <MediaPlayer :url="mediaUrl" :mime-type="mimeType" :file-name="fileName" />
    </template>

    <!-- Text Preview -->
    <template v-else-if="mimeType.startsWith('text/') || description === 'Text File'">
      <div class="w-full h-full glass rounded-2xl overflow-hidden">
        <div class="px-4 py-2 bg-black/5 border-b border-white/10 flex items-center gap-2">
          <span>📄</span>
          <span class="font-medium">{{ fileName }}</span>
          <span class="text-gray-500 text-sm ml-auto">{{ description }}</span>
        </div>
        <div class="h-[calc(100%-48px)]">
          <CodeViewer :code="textContent" language="plaintext" :read-only="true" />
        </div>
      </div>
    </template>

    <!-- Binary / Unsupported -->
    <template v-else>
      <div class="glass rounded-2xl p-8 text-center max-w-md">
        <div class="text-6xl mb-4">📦</div>
        <h3 class="text-xl font-semibold mb-2">暂不支持此文件类型</h3>
        <p class="text-gray-500 mb-4">{{ description }}</p>
        <div class="bg-black/5 rounded-lg p-4 text-left">
          <p class="text-sm"><span class="text-gray-500">文件名:</span> {{ fileName }}</p>
          <p class="text-sm"><span class="text-gray-500">MIME:</span> {{ mimeType }}</p>
          <p class="text-sm"><span class="text-gray-500">大小:</span> {{ (buffer.byteLength / 1024).toFixed(2) }} KB</p>
        </div>
      </div>
    </template>
  </div>
</template>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/FilePreview.vue
git commit -m "feat: add file preview component"
```

---

## Task 6: 美化拖拽引导页面

**Files:**
- Modify: `src/components/DropZone.vue`

- [ ] **Step 1: 重写 DropZone 组件**

```vue
<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'drop', dataTransfer: DataTransfer): void
}>()

const isDragging = ref(false)
const isHovering = ref(false)

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
  isHovering.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer) {
    emit('drop', e.dataTransfer)
  }
}

function onOpenClick() {
  const btn = document.querySelector('[data-open-folder]') as HTMLButtonElement
  btn?.click()
}
</script>

<template>
  <div
    class="h-full w-full flex items-center justify-center p-8"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <div
      class="glass rounded-3xl p-12 max-w-lg text-center transition-all duration-300"
      :class="{
        'scale-105 shadow-2xl border-2 border-purple-400/50': isDragging || isHovering
      }"
    >
      <!-- Icon -->
      <div
        class="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-6xl transition-transform"
        :class="{ 'scale-110': isDragging }"
      >
        💻
      </div>

      <!-- Title -->
      <h2 class="text-2xl font-bold gradient-text mb-3">
        选择文件夹开始反编译
      </h2>

      <!-- Subtitle -->
      <p class="text-gray-600 mb-6 leading-relaxed">
        点击右上角选择文件夹<br/>
        或将文件夹直接拖入此区域
      </p>

      <!-- Supported Files -->
      <div class="flex items-center justify-center gap-2 text-sm text-gray-500">
        <span class="px-3 py-1 bg-purple-100 text-purple-600 rounded-full font-medium">.lua</span>
        <span class="px-3 py-1 bg-purple-100 text-purple-600 rounded-full font-medium">.luac</span>
      </div>

      <!-- Drag Hint Overlay -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isDragging"
          class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl"
        >
          <div class="text-center">
            <div class="text-5xl mb-2">📂</div>
            <p class="text-lg font-semibold gradient-text">松开以加载文件夹</p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
```

- [ ] **Step 2: 提交**

```bash
git add src/components/DropZone.vue
git commit -m "feat: redesign drop zone with macOS glass style"
```

---

## Task 7: 美化文件树侧边栏

**Files:**
- Modify: `src/components/FolderTree.vue`
- Modify: `src/components/FileNode.vue`

- [ ] **Step 1: 更新 FolderTree 组件**

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
  <div class="h-full overflow-auto glass border-r border-white/20">
    <!-- Header -->
    <div class="sticky top-0 z-10 px-4 py-3 glass border-b border-white/10">
      <h2 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <span>📁</span>
        <span>文件浏览器</span>
      </h2>
    </div>

    <!-- File Tree -->
    <div class="py-2">
      <div v-if="tree.length === 0" class="p-4 text-center text-gray-500 text-sm">
        加载中...
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
  </div>
</template>
```

- [ ] **Step 2: 更新 FileNode 组件**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FileNode, FileSystemFileHandle } from '../types'

const props = defineProps<{
  node: FileNode
  depth: number
  selectedPath: string | null
}>()

const emit = defineEmits<{
  (e: 'select', path: string, handle: FileSystemFileHandle): void
}>()

const isExpanded = ref(props.depth === 0)
const isSelected = computed(() => props.node.path === props.selectedPath)

const paddingLeft = computed(() => `${props.depth * 16 + 12}px`)
const isLua = computed(() => /\.(lua|luac)$/i.test(props.node.name))
const isImage = computed(() => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(props.node.name))
const isAudio = computed(() => /\.(mp3|wav|ogg|flac)$/i.test(props.node.name))
const isVideo = computed(() => /\.(mp4|webm|avi|mov)$/i.test(props.node.name))

const icon = computed(() => {
  if (props.node.isDirectory) return isExpanded.value ? '📂' : '📁'
  if (isLua.value) return '📄'
  if (isImage.value) return '🖼️'
  if (isAudio.value) return '🎵'
  if (isVideo.value) return '🎬'
  if (/\.(json|xml|yaml|yml)$/i.test(props.node.name)) return '📋'
  if (/\.(txt|md|log)$/i.test(props.node.name)) return '📝'
  return '📦'
})

const fileColor = computed(() => {
  if (isLua.value) return 'text-blue-500'
  if (isImage.value) return 'text-pink-500'
  if (isAudio.value) return 'text-green-500'
  if (isVideo.value) return 'text-purple-500'
  return 'text-gray-500'
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
      class="flex items-center py-1.5 px-3 cursor-pointer select-none transition-all duration-150 group"
      :class="{
        'bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg mx-2': isSelected,
        'hover:bg-gray-100 rounded-lg mx-2': !isSelected
      }"
      :style="{ paddingLeft }"
      @click="toggle"
      @dblclick="select"
    >
      <span class="mr-2 text-base transition-transform" :class="{ 'scale-110': isSelected }">
        {{ icon }}
      </span>
      <span
        class="truncate text-sm font-medium transition-colors"
        :class="[isSelected ? 'text-gray-800' : 'text-gray-600', fileColor]"
      >
        {{ node.name }}
      </span>
      <span
        v-if="node.isDirectory"
        class="ml-auto text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {{ isExpanded ? '▼' : '▶' }}
      </span>
    </div>
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isExpanded && node.children" class="overflow-hidden">
        <FileNode
          v-for="child in node.children"
          :key="child.path"
          :node="child"
          :depth="depth + 1"
          :selected-path="selectedPath"
          @select="(p, h) => emit('select', p, h)"
        />
      </div>
    </Transition>
  </div>
</template>
```

- [ ] **Step 3: 提交**

```bash
git add src/components/FolderTree.vue src/components/FileNode.vue
git commit -m "style: redesign sidebar with glassmorphism"
```

---

## Task 8: 重构主布局 App.vue

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: 重写 App.vue**

```vue
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
  <div class="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
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
            data-open-folder
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
          <div v-if="currentFileName" class="glass px-4 py-2 border-b border-white/20 flex items-center gap-2">
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
            <div v-else class="h-full flex items-center justify-center text-gray-400">
              <div class="text-center">
                <div class="text-5xl mb-4">👈</div>
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
```

- [ ] **Step 2: 更新 useFileSystem.ts 添加 getFileInfo**

```typescript
// 在 useFileSystem.ts 中添加
export interface FileInfo {
  size: number
  encoding: string
  modified?: Date
  lastModified?: number
}

async function getFileInfo(fileHandle: FileSystemFileHandle): Promise<FileInfo | null> {
  try {
    const file = await fileHandle.getFile()
    return {
      size: file.size,
      encoding: 'UTF-8', // Simplified, could detect actual encoding
      modified: file.lastModified ? new Date(file.lastModified) : undefined,
      lastModified: file.lastModified
    }
  } catch (e) {
    console.error('Failed to get file info:', e)
    return null
  }
}

// 在返回值中添加
return {
  // ...existing
  getFileInfo
}
```

- [ ] **Step 3: 提交**

```bash
git add src/App.vue src/composables/useFileSystem.ts
git commit -m "refactor: complete UI redesign with macOS style"
```

---

## Task 9: 响应式适配

**Files:**
- Modify: `src/App.vue` (添加响应式类)

- [ ] **Step 1: 添加响应式断点**

在 App.vue 的 `<style>` 部分或通过 Tailwind 类添加响应式支持：

```vue
<!-- 在 sidebar 添加响应式类 -->
<aside v-if="hasProject" class="w-72 flex-shrink-0 flex flex-col max-lg:hidden">
```

在 DropZone 添加响应式：

```vue
<div class="glass rounded-3xl p-8 md:p-12 max-w-lg w-full mx-auto text-center">
  <!-- 图标尺寸响应式 -->
  <div class="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6">
```

- [ ] **Step 2: 提交**

```bash
git add src/App.vue
git commit -m "feat: add responsive breakpoints for tablet/mobile"
```

---

## Task 10: 测试验证

- [ ] **Step 1: 启动开发服务器**

```bash
cd "C:/Users/admin/code/ai/luajit-decompiler-online"
npm run dev
```

- [ ] **Step 2: 测试清单**

- [ ] 打开页面，检查首页拖拽引导卡片显示正常
- [ ] 点击右上角"打开文件夹"按钮，选择包含 .lua 文件的文件夹
- [ ] 检查侧边栏文件树毛玻璃效果、选中高亮
- [ ] 点击 .lua 文件，检查反编译结果
- [ ] 点击 .txt 或其他文本文件，检查文本预览
- [ ] 点击 .png/.jpg 图片文件，检查图片预览
- [ ] 点击 .mp3/.mp4 音视频文件，检查播放器
- [ ] 点击 .exe/.dll 等二进制文件，检查不支持提示
- [ ] 检查底部状态栏展开/收起功能
- [ ] 调整浏览器窗口大小，测试响应式布局

- [ ] **Step 3: 提交最终版本**

```bash
git add -A
git commit -m "feat: complete UI redesign - macOS Sonoma style"
```

---

## 总结

实现完成后，界面将具有以下特性：
- macOS Sonoma 毛玻璃效果
- 蓝紫渐变主题
- 智能文件类型识别
- 可展开状态栏
- 响应式布局