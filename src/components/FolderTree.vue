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
  <div class="h-full flex flex-col glass border-r border-white/20">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-white/10 flex-shrink-0">
      <h2 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <span aria-hidden="true">📁</span>
        <span>文件浏览器</span>
      </h2>
    </div>

    <!-- File Tree -->
    <div class="flex-1 overflow-auto py-2">
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