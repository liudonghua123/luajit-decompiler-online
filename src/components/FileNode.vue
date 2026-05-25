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
      :class="{ 'bg-blue-200': isSelected }"
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