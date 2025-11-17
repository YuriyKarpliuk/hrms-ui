<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
    <h1 class="text-3xl font-extrabold text-orange-500 mb-6">Team Payrolls</h1>

    <div class="flex flex-wrap gap-4 mb-6 items-end">
      <input
        v-model="filters.employeeName"
        type="text"
        placeholder="Search by employee name..."
        class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
      />

      <input
        v-model.number="filters.employeeId"
        type="number"
        placeholder="Employee ID"
        class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm w-36"
      />

      <select
        v-model="filters.status"
        class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
      >
        <option value="">All Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="PAID">Paid</option>
        <option value="FAILED">Failed</option>
      </select>

      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-500 dark:text-gray-400">From</label>
        <input
          type="date"
          v-model="filters.startFrom"
          class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
        />
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-500 dark:text-gray-400">To</label>
        <input
          type="date"
          v-model="filters.endTo"
          class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
        />
      </div>

      <button
        @click="fetchPayrolls(0)"
        class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition"
      >
        Filter
      </button>
      <button
        @click="clearFilters"
        class="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg transition"
      >
        Clear Filters
      </button>
    </div>

    <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 py-10">
      Loading team payrolls...
    </div>

    <div
      v-else-if="payrolls.length"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-x-auto border border-gray-200 dark:border-gray-700"
    >
      <table class="min-w-full border-collapse">
        <thead class="bg-gray-100 dark:bg-gray-700 text-left">
          <tr>
            <th class="py-3 px-5">Employee</th>
            <th class="py-3 px-5">Period Start</th>
            <th class="py-3 px-5">Period End</th>
            <th class="py-3 px-5">Base Salary</th>
            <th class="py-3 px-5">Net Salary</th>
            <th class="py-3 px-5">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in payrolls"
            :key="p.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <td class="py-3 px-5 font-medium">
              {{ formatEmployeeName(p.employeeFirstName, p.employeeLastName) }}
            </td>
            <td class="py-3 px-5">{{ formatDate(p.periodStart) }}</td>
            <td class="py-3 px-5">{{ formatDate(p.periodEnd) }}</td>
            <td class="py-3 px-5">{{ formatCurrency(p.baseSalary) }}</td>
            <td class="py-3 px-5 font-semibold text-green-500">
              {{ formatCurrency(p.netSalary) }}
            </td>
            <td class="py-3 px-5">
              <span
                class="px-3 py-1 text-xs font-semibold rounded-full"
                :class="{
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200': p.status === 'PENDING',
                  'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200': p.status === 'PAID',
                  'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200': p.status === 'FAILED'
                }"
              >
                {{ p.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex justify-between items-center p-6">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 0"
          class="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-40"
        >
          Prev
        </button>
        <span class="text-gray-400">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= totalPages - 1"
          class="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>

    <p v-else class="text-gray-500 italic text-center py-10">
      No payrolls found for your team. Try adjusting filters.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../lib/api'

interface PayrollResponse {
  id: number
  employeeFirstName?: string
  employeeLastName?: string
  baseSalary: number
  netSalary: number
  periodStart: string
  periodEnd: string
  status: 'PENDING' | 'PAID' | 'FAILED'
}

const payrolls = ref<PayrollResponse[]>([])
const filters = ref({
  employeeId: '',
  employeeName: '',
  status: '',
  startFrom: '',
  endTo: ''
})
const currentPage = ref(0)
const totalPages = ref(1)
const loading = ref(false)
const alertMsg = ref('')

function formatEmployeeName(first?: string, last?: string) {
  if (!first && !last) return '—'
  return `${first || ''} ${last || ''}`.trim()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value)
}

function showMessage(msg: string) {
  alertMsg.value = msg
  setTimeout(() => (alertMsg.value = ''), 3000)
}

async function fetchPayrolls(page = 0) {
  const managerId = localStorage.getItem('currentUserId')
  if (!managerId) return
  loading.value = true

  const params = new URLSearchParams()
  params.append('managerId', managerId)
  params.append('page', page.toString())
  params.append('size', '8')

  if (filters.value.employeeId) params.append('employeeId', filters.value.employeeId.toString())
  if (filters.value.employeeName) params.append('employeeName', filters.value.employeeName)
  if (filters.value.status) params.append('status', filters.value.status)
  if (filters.value.startFrom) params.append('startFrom', filters.value.startFrom)
  if (filters.value.endTo) params.append('endTo', filters.value.endTo)

  try {
    const { data } = await api.get(`/api/v1/payrolls/team?${params.toString()}`)
    payrolls.value = data.content || []
    totalPages.value = data.totalPages || 1
    currentPage.value = data.number || 0
  } catch {
    showMessage('Failed to load team payrolls.')
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  filters.value = { employeeId: '', employeeName: '', status: '', startFrom: '', endTo: '' }
  fetchPayrolls(0)
}

function changePage(newPage: number) {
  if (newPage >= 0 && newPage < totalPages.value) fetchPayrolls(newPage)
}

onMounted(() => fetchPayrolls(0))
</script>
