<template>
  <section
    class="bg-gray-800/80 border border-gray-700 rounded-xl p-5 relative"
  >
    <header class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-semibold text-orange-400">{{ title }}</h3>
      </div>
      <button
        v-if="editable"
        @click="$emit('edit', $event)"
        class="text-gray-400 hover:text-orange-400 transition-all"
      >
        ✏️
      </button>
    </header>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps({
  title: String,
  editable: Boolean,
});
</script>
