<script setup lang="ts">
import { computed } from 'vue'
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

const isImage = computed(() => props.mimeType.startsWith('image/'))
const isMedia = computed(() => props.mimeType.startsWith('audio/') || props.mimeType.startsWith('video/'))
const isText = computed(() => props.mimeType.startsWith('text/') || props.description === 'Text File')
const fileSizeKb = computed(() => (props.buffer.byteLength / 1024).toFixed(2))
</script>

<template>
  <div class="h-full flex items-center justify-center p-4 md:p-8 overflow-auto">
    <!-- Image Preview -->
    <template v-if="isImage">
      <div class="glass rounded-2xl p-4 max-w-full">
        <img
          :src="imageUrl"
          :alt="fileName"
          class="max-w-full max-h-[60vh] rounded-lg shadow-lg"
        />
        <p class="text-center text-sm text-gray-500 mt-3">{{ description }}</p>
      </div>
    </template>

    <!-- Audio/Video Preview -->
    <template v-else-if="isMedia">
      <MediaPlayer :url="mediaUrl" :mime-type="mimeType" :file-name="fileName" />
    </template>

    <!-- Text Preview -->
    <template v-else-if="isText">
      <div class="w-full h-full glass rounded-2xl overflow-hidden flex flex-col">
        <div class="px-4 py-3 bg-black/5 border-b border-white/10 flex items-center gap-2 flex-shrink-0">
          <span aria-hidden="true">📄</span>
          <span class="font-medium">{{ fileName }}</span>
          <span class="text-gray-500 text-sm ml-auto">{{ description }}</span>
        </div>
        <div class="flex-1 overflow-hidden">
          <CodeViewer :code="textContent" language="plaintext" :read-only="true" />
        </div>
      </div>
    </template>

    <!-- Binary / Unsupported -->
    <template v-else>
      <div class="glass rounded-2xl p-8 text-center max-w-md">
        <div class="text-6xl mb-4" aria-hidden="true">📦</div>
        <h3 class="text-xl font-semibold mb-2">暂不支持此文件类型</h3>
        <p class="text-gray-500 mb-6">{{ description }}</p>
        <div class="bg-black/5 rounded-xl p-4 text-left">
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-gray-500">文件名:</dt>
              <dd class="font-medium truncate max-w-[200px]">{{ fileName }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">MIME:</dt>
              <dd class="font-mono text-xs">{{ mimeType }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">大小:</dt>
              <dd>{{ fileSizeKb }} KB</dd>
            </div>
          </dl>
        </div>
      </div>
    </template>
  </div>
</template>