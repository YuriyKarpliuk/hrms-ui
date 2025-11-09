<template>
  <transition name="fade-scale">
    <div
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]"
    >
      <div
        class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
      >
        <header class="flex justify-between items-center mb-4 sticky top-0 bg-gray-800 z-10 border-b border-gray-700 pb-2">
          <h3 class="text-xl font-semibold text-orange-400">{{ title }}</h3>
          <button
            @click="close"
            class="text-gray-400 hover:text-orange-400 text-lg leading-none"
          >
            ✖
          </button>
        </header>

        <slot />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['close'])
defineProps({ title: String })

function close() {
  emit('close')
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  const middleY = document.body.scrollHeight / 2 - window.innerHeight / 2
  window.scrollTo({ top: middleY, behavior: 'smooth' })
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.25s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
