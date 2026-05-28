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
        'bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-lg mx-2 shadow-sm': isSelected,
        'hover:bg-gray-100 rounded-lg mx-2': !isSelected
      }"
      :style="{ paddingLeft }"
      @click="toggle"
      @dblclick="select"
    >
      <span class="mr-2 text-base transition-transform" :class="{ 'scale-110': isSelected }" aria-hidden="true">
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
        aria-hidden="true"
      >
        {{ isExpanded ? '▼' : '▶' }}
      </span>
    </div>
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
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