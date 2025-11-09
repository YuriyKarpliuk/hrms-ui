<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'

const route = useRoute()
const isCollapsed = ref(false)
const toggleSidebar = () => (isCollapsed.value = !isCollapsed.value)

const noLayoutRoutes = ['/login', '/home']

const showLayout = computed(() => !noLayoutRoutes.includes(route.path))
</script>

<template>
  <div class="flex min-h-screen">

    <Sidebar
      v-if="showLayout"
      :collapsed="isCollapsed"
      @toggleCollapse="toggleSidebar"
    />

    <div :class="showLayout ? (isCollapsed ? 'ml-20 w-full' : 'ml-64 w-full') : 'w-full'">

      <Navbar 
        v-if="showLayout" 
        :collapsed="isCollapsed" 
        @toggleCollapse="toggleSidebar"  
      />

      <main :class="showLayout ? 'pt-20 p-6 transition-all duration-300 ease-in-out' : 'p-0'">
        <RouterView />
      </main>

    </div>
  </div>
</template>
