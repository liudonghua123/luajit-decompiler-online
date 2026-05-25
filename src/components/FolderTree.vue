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