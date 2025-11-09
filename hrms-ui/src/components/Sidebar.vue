<template>
  <aside
    class="fixed top-0 left-0 h-screen bg-gray-900 border-r border-gray-800 transition-all duration-300 z-40"
    :class="collapsed ? 'w-20' : 'w-64'"
  >
    <RouterLink
      to="/home"
      class="flex items-center justify-center h-16 border-b border-gray-800 hover:bg-gray-800 transition"
    >
      <h1
        class="text-2xl font-bold text-orange-500 transition-all"
        v-if="!collapsed"
      >
        KADRify
      </h1>
      <h1
        class="text-xl font-bold text-orange-500 transition-all"
        v-else
      >
        K
      </h1>
    </RouterLink>

    <nav class="mt-6 space-y-2">
      <RouterLink
        v-for="item in visibleMenuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-orange-400 transition rounded-md"
        :class="{ 'bg-gray-800 text-orange-400': route.path === item.path }"
      >
        <component :is="item.icon" class="w-5 h-5" />
        <span v-if="!collapsed">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>


<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"
import {
  Home,
  Calendar,
  Clock,
  Wallet,
  Users,
} from "lucide-vue-next"
import { getUserRoles } from "../services/authService"

const { collapsed } = defineProps<{ collapsed: boolean }>()
const route = useRoute()

const roles = getUserRoles()

const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home, roles: ["USER", "HR", "ADMIN"] },
  { path: "/leaves", label: "Leaves", icon: Calendar, roles: ["USER", "HR", "MANAGER", "ADMIN"] },
  { path: "/manager/leaves", label: "Team Leaves", icon: Calendar, roles: ["MANAGER"] },
  { path: "/timesheets", label: "Timesheet", icon: Clock, roles: ["USER", "MANAGER"] },
{ path: "/manager/timesheets", label: "Team Timesheets", icon: Clock, roles: ["MANAGER"] },
  { path: "/payrolls", label: "Payroll", icon: Wallet, roles: ["USER", "MANAGER"] },
  { path: "/manager/payrolls", label: "Team Payrolls", icon: Wallet, roles: ["MANAGER"] },
  { path: "/employees", label: "Employees", icon: Users, roles: ["HR", "ADMIN",] },
]

const visibleMenuItems = computed(() =>
  menuItems.filter((item) => item.roles.some((r) => roles.includes(r)))
)
</script>

<style scoped>
aside {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #444 transparent;
}
</style>
