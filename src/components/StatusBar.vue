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
const expandedId = 'status-bar-details'

const sizeFormatted = computed(() => {
  if (props.fileSize === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(props.fileSize) / Math.log(k))
  return parseFloat((props.fileSize / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
})

const statusIcon = computed(() => {
  switch (props.decompileStatus) {
    case 'success': return { emoji: '✅', label: '成功' }
    case 'error': return { emoji: '❌', label: '失败' }
    default: return { emoji: '⏳', label: '等待' }
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
      role="button"
      :aria-expanded="isExpanded"
      :aria-controls="expandedId"
      tabindex="0"
      @click="toggle"
      @keydown.enter="toggle"
      @keydown.space.prevent="toggle"
    >
      <div class="flex items-center gap-3 text-sm">
        <span class="opacity-70" aria-hidden="true">📄</span>
        <span class="font-medium">{{ fileName || 'No file selected' }}</span>
        <span v-if="fileName" class="text-gray-500">·</span>
        <span v-if="fileName" class="text-gray-500">{{ sizeFormatted }}</span>
        <span v-if="fileName" class="text-gray-500">·</span>
        <span v-if="fileName" class="text-gray-500">{{ fileType }}</span>
        <span v-if="fileName && modifiedTime" class="text-gray-500">·</span>
        <span v-if="fileName && modifiedTime" class="text-gray-500">修改于 {{ modifiedTime }}</span>
      </div>
      <div class="flex items-center gap-4">
        <span v-if="decompileStatus" class="text-sm" :aria-label="`状态: ${statusText}`">
          <span aria-hidden="true">{{ statusIcon.emoji }}</span>
          {{ statusText }}
        </span>
        <span class="text-gray-400 transform transition-transform" :class="{ 'rotate-180': isExpanded }" aria-hidden="true">
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
      <div
        v-if="isExpanded"
        :id="expandedId"
        class="overflow-hidden border-t border-white/10"
        role="region"
        aria-label="文件详细信息"
      >
        <div class="p-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm md:grid-cols-1">
          <div class="flex justify-between">
            <span class="text-gray-500">文件名:</span>
            <span class="font-medium">{{ fileName || '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">大小:</span>
            <span>{{ sizeFormatted }}</span>
          </div>
          <div class="flex justify-between col-span-2 md:col-span-1">
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