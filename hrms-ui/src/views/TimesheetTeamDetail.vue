<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
    <div class="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6">
      <h1 class="text-2xl font-bold text-orange-500 mb-4">Timesheet Details</h1>

      <div v-if="loading" class="text-center text-gray-400 py-10">Loading timesheet details...</div>

      <div v-else-if="timesheet" class="space-y-4">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><span class="font-semibold">Employee:</span> {{ timesheet.employeeFirstName }} {{ timesheet.employeeLastName }}</div>
          <div><span class="font-semibold">Week Start:</span> {{ timesheet.weekStart }}</div>
          <div><span class="font-semibold">Week End:</span> {{ timesheet.weekEnd }}</div>
          <div><span class="font-semibold">Total Hours:</span> {{ timesheet.totalHours ?? '—' }}</div>
          <div><span class="font-semibold">Status:</span> {{ timesheet.status }}</div>
        </div>

        <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-6">Entries</h2>
        <table class="min-w-full border-collapse mt-2 text-sm">
          <thead class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            <tr>
              <th class="py-2 px-4 text-left">Date</th>
              <th class="py-2 px-4 text-left">Activity Type</th>
              <th class="py-2 px-4 text-left">Notes</th>
              <th class="py-2 px-4 text-center">Hours</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entry, i) in timesheet.entries"
              :key="i"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition border-t border-gray-600"
            >
              <td class="py-2 px-4">{{ entry.workDate }}</td>
              <td class="py-2 px-4">{{ entry.activityType }}</td>
              <td class="py-2 px-4">{{ entry.notes }}</td>
              <td class="py-2 px-4 text-center">{{ entry.hours }}</td>
            </tr>
          </tbody>
        </table>

        <div class="mt-6 flex justify-end">
          <button @click="goBack" class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition">Back</button>
        </div>
      </div>

      <div v-else class="text-center text-gray-500 italic py-10">
        Timesheet not found.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../lib/api'

const route = useRoute()
const router = useRouter()
const timesheet = ref<any>(null)
const loading = ref(true)

async function fetchDetails() {
  try {
    const id = route.params.id
    const { data } = await api.get(`/api/v1/timesheets/${id}`)
    timesheet.value = data
  } catch (err) {
    console.error('Error loading timesheet:', err)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

onMounted(fetchDetails)
</script>
