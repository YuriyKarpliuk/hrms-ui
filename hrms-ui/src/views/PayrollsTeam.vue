<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
    <h1 class="text-3xl font-extrabold text-orange-500 mb-6">Team Payrolls</h1>

    <div v-if="payrolls.length" class="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-x-auto">
      <table class="min-w-full border-collapse">
        <thead class="bg-gray-100 dark:bg-gray-700 text-left">
          <tr>
            <th class="py-3 px-5">Employee</th>
            <th class="py-3 px-5">Month</th>
            <th class="py-3 px-5">Base Salary</th>
            <th class="py-3 px-5">Bonus</th>
            <th class="py-3 px-5">Total</th>
            <th class="py-3 px-5">Status</th>
            <th class="py-3 px-5 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in payrolls"
            :key="p.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <td class="py-3 px-5 font-medium">{{ p.employeeName }}</td>
            <td class="py-3 px-5">{{ p.month }}</td>
            <td class="py-3 px-5">${{ p.baseSalary.toFixed(2) }}</td>
            <td class="py-3 px-5">${{ p.bonus.toFixed(2) }}</td>
            <td class="py-3 px-5 font-semibold">${{ (p.baseSalary + p.bonus).toFixed(2) }}</td>
            <td class="py-3 px-5">
              <span
                class="px-3 py-1 text-xs font-semibold rounded-full"
                :class="{
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200': p.status === 'PENDING',
                  'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200': p.status === 'APPROVED',
                  'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200': p.status === 'REJECTED'
                }"
              >
                {{ p.status }}
              </span>
            </td>
            <td class="py-3 px-5 text-center space-x-2">
              <button
                v-if="p.status === 'PENDING'"
                @click="approve(p.id)"
                class="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded-lg transition"
              >
                Approve
              </button>
              <button
                v-if="p.status === 'PENDING'"
                @click="reject(p.id)"
                class="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded-lg transition"
              >
                Reject
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-gray-500 italic">No payroll records found.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../lib/api'

interface PayrollResponse {
  id: number
  employeeName: string
  month: string
  baseSalary: number
  bonus: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

const payrolls = ref<PayrollResponse[]>([])

async function fetchPayrolls() {
  const managerId = localStorage.getItem('currentUserId')
  try {
    const { data } = await api.get(`/api/v1/payrolls/employee/${managerId}`)
    payrolls.value = data
  } catch (err) {
    console.error('Error loading payrolls:', err)
  }
}

async function approve(id: number) {
  await api.post(`/api/v1/payrolls/${id}/approve`)
  payrolls.value = payrolls.value.map(p => (p.id === id ? { ...p, status: 'APPROVED' } : p))
}

async function reject(id: number) {
  await api.post(`/api/v1/payrolls/${id}/reject`)
  payrolls.value = payrolls.value.map(p => (p.id === id ? { ...p, status: 'REJECTED' } : p))
}

onMounted(fetchPayrolls)
</script>
