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