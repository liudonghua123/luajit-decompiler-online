<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  url: string
  mimeType: string
  fileName: string
}>()

const mediaRef = ref<HTMLMediaElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const playbackRate = ref(1)
const isLoaded = ref(false)
const barHeights = ref<number[]>(Array.from({ length: 20 }, () => 20 + Math.random() * 40))

const isAudio = computed(() => props.mimeType.startsWith('audio/'))
const isVideo = computed(() => props.mimeType.startsWith('video/'))

const progress = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

function togglePlay() {
  if (!mediaRef.value) return

  if (isPlaying.value) {
    mediaRef.value.pause()
  } else {
    mediaRef.value.play()
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

function seek(e: MouseEvent | { type: string; direction?: 'left' | 'right' }) {
  if (e.type === 'keydown') {
    const direction = (e as KeyboardEvent).key === 'ArrowLeft' ? 'left' : 'right'
    if (mediaRef.value) {
      const delta = duration.value * 0.05 // 5% of duration
      mediaRef.value.currentTime = direction === 'left'
        ? Math.max(0, mediaRef.value.currentTime - delta)
        : Math.min(duration.value, mediaRef.value.currentTime + delta)
    }
    return
  }
  const bar = (e as MouseEvent).currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const percent = ((e as MouseEvent).clientX - rect.left) / rect.width
  if (mediaRef.value) {
    mediaRef.value.currentTime = percent * duration.value
  }
}

function changeVolume(e: Event) {
  const input = e.target as HTMLInputElement
  volume.value = parseFloat(input.value)
  if (mediaRef.value) {
    mediaRef.value.volume = volume.value
  }
}

function changeRate(rate: number) {
  playbackRate.value = rate
  if (mediaRef.value) {
    mediaRef.value.playbackRate = rate
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
      <span class="text-2xl" aria-hidden="true">{{ isVideo ? '🎬' : '🎵' }}</span>
      <div>
        <h3 class="font-semibold">{{ fileName }}</h3>
        <p class="text-sm text-gray-500">{{ mimeType }}</p>
      </div>
    </div>

    <!-- Media Element -->
    <div class="relative rounded-xl overflow-hidden bg-black/10 mb-4">
      <video
        v-if="isVideo"
        ref="mediaRef"
        :src="url"
        class="w-full max-h-80 mx-auto"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @play="isPlaying = true"
        @pause="isPlaying = false"
      />
      <audio
        v-if="isAudio"
        ref="mediaRef"
        :src="url"
        class="w-full"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @play="isPlaying = true"
        @pause="isPlaying = false"
      />

      <!-- Audio Visualizer Placeholder -->
      <div v-if="isAudio && isLoaded" class="h-20 flex items-center justify-center gap-1">
        <div v-for="(height, i) in barHeights" :key="i" class="w-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full animate-pulse" :style="{ height: `${height}px`, animationDelay: `${i * 0.05}s` }"></div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div
      class="h-2 bg-gray-200 rounded-full cursor-pointer mb-4 overflow-hidden"
      role="slider"
      :aria-valuenow="Math.round(currentTime)"
      :aria-valuemin="0"
      :aria-valuemax="Math.round(duration)"
      aria-label="播放进度"
      tabindex="0"
      @click="seek"
      @keydown.left="seek({ type: 'keydown', direction: 'left' } as any)"
      @keydown.right="seek({ type: 'keydown', direction: 'right' } as any)"
    >
      <div
        class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
        :style="{ width: `${progress}%` }"
      />
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4">
        <!-- Play/Pause -->
        <button
          class="w-12 h-12 rounded-full btn-gradient flex items-center justify-center text-xl"
          :aria-label="isPlaying ? '暂停' : '播放'"
          @click="togglePlay"
        >
          <span aria-hidden="true">{{ isPlaying ? '⏸' : '▶️' }}</span>
        </button>

        <!-- Time -->
        <span class="text-sm text-gray-500 font-mono">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </span>
      </div>

      <div class="flex items-center gap-4 flex-wrap">
        <!-- Volume -->
        <div class="flex items-center gap-2">
          <span aria-hidden="true">{{ volume > 0 ? '🔊' : '🔇' }}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            :value="volume"
            class="w-20 accent-purple-500"
            aria-label="音量"
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