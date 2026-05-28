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
</script>

<template>
  <div
    class="h-full w-full flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <div
      class="glass rounded-3xl p-10 md:p-14 max-w-lg w-full text-center transition-all duration-300 relative overflow-hidden"
      :class="{
        'scale-[1.02] shadow-2xl ring-4 ring-purple-400/30': isDragging || isHovering
      }"
    >
      <!-- Background Decoration -->
      <div class="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div class="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
        <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10">
        <!-- Icon -->
        <div
          class="w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center text-6xl transition-transform duration-300"
          :class="{ 'scale-110 rotate-3': isDragging }"
        >
          💻
        </div>

        <!-- Title -->
        <h2 class="text-2xl md:text-3xl font-bold gradient-text mb-3">
          选择文件夹开始反编译
        </h2>

        <!-- Subtitle -->
        <p class="text-gray-600 mb-8 leading-relaxed">
          点击右上角选择文件夹<br/>
          或将文件夹直接拖入此区域
        </p>

        <!-- Supported Files Badge -->
        <div class="flex items-center justify-center gap-3 flex-wrap">
          <span class="px-4 py-1.5 bg-purple-100 text-purple-600 rounded-full font-medium text-sm">.lua</span>
          <span class="px-4 py-1.5 bg-purple-100 text-purple-600 rounded-full font-medium text-sm">.luac</span>
        </div>
      </div>

      <!-- Drag Overlay -->
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
          class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl backdrop-blur-sm"
        >
          <div class="text-center">
            <div class="text-6xl mb-3">📂</div>
            <p class="text-lg font-semibold gradient-text">松开以加载文件夹</p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>