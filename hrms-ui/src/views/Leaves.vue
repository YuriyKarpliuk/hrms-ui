<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
    <h1 class="text-3xl font-extrabold text-orange-500 mb-6">Leave Requests</h1>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-x-auto">
      <table class="min-w-full border-collapse">
        <thead class="bg-gray-100 dark:bg-gray-700 text-left">
          <tr>
            <th class="py-3 px-5">Employee</th>
            <th class="py-3 px-5">Department</th>
            <th class="py-3 px-5">From</th>
            <th class="py-3 px-5">To</th>
            <th class="py-3 px-5">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="leave in leaves" :key="leave.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <td class="py-3 px-5">{{ leave.employee }}</td>
            <td class="py-3 px-5">{{ leave.department }}</td>
            <td class="py-3 px-5">{{ leave.from }}</td>
            <td class="py-3 px-5">{{ leave.to }}</td>
            <td class="py-3 px-5">
              <span class="px-3 py-1 text-xs font-semibold rounded-full"
                :class="{
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200': leave.status === 'Pending',
                  'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200': leave.status === 'Approved',
                  'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200': leave.status === 'Rejected'
                }">
                {{ leave.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const leaves = [
  { id: 1, employee: 'Alice Johnson', department: 'Engineering', from: '2025-11-01', to: '2025-11-10', status: 'Approved' },
  { id: 2, employee: 'Bob Smith', department: 'Finance', from: '2025-11-05', to: '2025-11-07', status: 'Pending' },
  { id: 3, employee: 'Charlie Brown', department: 'HR', from: '2025-11-03', to: '2025-11-09', status: 'Rejected' },
]
</script>
