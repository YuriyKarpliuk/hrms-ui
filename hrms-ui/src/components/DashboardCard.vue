<template>
  <div
    class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition transform hover:-translate-y-1 duration-300 flex flex-col justify-between"
  >
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold">{{ title }}</h2>
      <span class="text-3xl">{{ icon }}</span>
    </div>
    <p class="text-4xl font-bold text-orange-500 mt-2">{{ value }}</p>
    <p class="text-sm text-gray-400 mt-1">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: number
  icon: string
  subtitle?: string
}>()
</script>
