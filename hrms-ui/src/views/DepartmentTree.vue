<template>
  <ul class="pl-4 border-l border-gray-700 space-y-2">
    <li v-for="dept in departments" :key="dept.id">
      <div
        class="flex items-center gap-2 py-1 cursor-pointer select-none hover:text-orange-400 transition"
        @click="toggle(dept.id)"
      >
        <button
          v-if="dept.children?.length"
          class="text-gray-400 hover:text-orange-400 transition"
        >
          <svg
            v-if="isExpanded(dept.id)"
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 15l7-7 7 7"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <span class="font-semibold">{{ dept.name }}</span>
        <span v-if="dept.managerName" class="text-xs text-gray-400"
          >• Manager: {{ dept.managerName }}</span
        >
      </div>

      <transition name="fade">
        <div
          v-if="isExpanded(dept.id) && dept.employees?.length"
          class="ml-6 mt-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 shadow-md"
        >
          <h4
            class="text-md text-orange-400 font-semibold mb-3 flex items-center gap-2"
          >
            👥 Employees ({{ dept.employees.length }})
          </h4>

          <ul class="space-y-3">
            <li
              v-for="emp in dept.employees"
              :key="emp.id"
              class="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg transition cursor-pointer"
              @click="goToEmployee(emp.id)"
            >
              <img
                :src="emp.avatarUrl || '/default-avatar.png'"
                class="w-10 h-10 rounded-full border border-gray-600 object-cover"
              />

              <div class="flex flex-col">
                <span class="font-semibold text-gray-100 text-sm">
                  {{ emp.firstName }} {{ emp.lastName }}
                </span>

                <span class="text-xs text-gray-300">
                  {{ emp.position || "No Position" }}
                </span>

                <span class="text-xs text-orange-400 hover:underline">
                  {{ emp.email }}
                </span>
              </div>

              <div class="ml-auto flex items-center gap-2">
                <span
                  class="px-2 py-1 rounded-full text-[10px] font-semibold"
                  :class="statusColor(emp.status)"
                >
                  {{ emp.status }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </transition>

      <transition name="fade">
        <DepartmentTree
          v-if="dept.children?.length && isExpanded(dept.id)"
          :departments="dept.children"
        />
      </transition>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from 'vue-router'
const router = useRouter()
const props = defineProps<{ departments: any[] }>();

const expanded = ref<Set<number>>(new Set());

function toggle(id: number) {
  if (expanded.value.has(id)) expanded.value.delete(id);
  else expanded.value.add(id);
}
function goToEmployee(id: number) {
  router.push(`/search/employees/${id}`)
}

function statusColor(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-500/20 text-green-300 border border-green-600'
    case 'ON_LEAVE':
      return 'bg-yellow-500/20 text-yellow-300 border border-yellow-600'
    case 'TERMINATED':
      return 'bg-red-500/20 text-red-300 border border-red-600'
    default:
      return 'bg-gray-600/40 text-gray-300 border border-gray-500'
  }
}

function isExpanded(id: number) {
  return expanded.value.has(id);
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
