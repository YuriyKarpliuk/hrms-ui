<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
    <h1 class="text-3xl font-extrabold text-orange-500 mb-6">Team Leave Requests</h1>

    <div class="flex flex-wrap gap-4 mb-6">
      <input
        v-model="filters.employeeName"
        type="text"
        placeholder="Search by employee name..."
        class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
      />
      <select
        v-model="filters.type"
        class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
      >
        <option value="">All Types</option>
        <option value="SICK">Sick</option>
        <option value="VACATION">Vacation</option>
        <option value="UNPAID">Unpaid</option>
      </select>
      <select
        v-model="filters.status"
        class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
      >
        <option value="">All Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
      </select>
      <button
        @click="fetchLeaves(0)"
        class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition"
      >
        Filter
      </button>
      <button
        @click="clearFilters"
        class="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-5 py-2 rounded-lg"
      >
        Clear Filters
      </button>
    </div>

    <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 py-10">
      Loading team leaves...
    </div>

    <div
      v-else-if="leaves.length"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-x-auto border border-gray-200 dark:border-gray-700"
    >
      <table class="min-w-full border-collapse">
        <thead class="bg-gray-100 dark:bg-gray-700 text-left">
          <tr>
            <th class="py-3 px-5">Employee</th>
            <th class="py-3 px-5">Type</th>
            <th class="py-3 px-5">From</th>
            <th class="py-3 px-5">To</th>
            <th class="py-3 px-5">Reason</th>
            <th class="py-3 px-5">Status</th>
            <th class="py-3 px-5 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="leave in leaves"
            :key="leave.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <td class="py-3 px-5 font-medium">
              {{ formatEmployeeName(leave.employeeFirstName, leave.employeeLastName) }}
            </td>
            <td class="py-3 px-5">{{ typeLabels[leave.type] || leave.type }}</td>
            <td class="py-3 px-5">{{ leave.startDate }}</td>
            <td class="py-3 px-5">{{ leave.endDate }}</td>
            <td class="py-3 px-5">{{ leave.reason || '—' }}</td>
            <td class="py-3 px-5">
              <span
                class="px-3 py-1 text-xs font-semibold rounded-full"
                :class="{
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200': leave.status === 'PENDING',
                  'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200': leave.status === 'APPROVED',
                  'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200': leave.status === 'REJECTED'
                }"
              >
                {{ leave.status }}
              </span>
            </td>
            <td class="py-3 px-5 text-center space-x-2">
              <button
                v-if="leave.status === 'PENDING'"
                @click="approve(leave.id)"
                class="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded-lg transition"
              >
                Approve
              </button>
              <button
                v-if="leave.status === 'PENDING'"
                @click="reject(leave.id)"
                class="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded-lg transition"
              >
                Reject
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-gray-500 italic">No team leave requests found.</p>

    <div
      v-if="totalPages > 1"
      class="flex justify-center items-center mt-6 gap-3 text-sm text-gray-700 dark:text-gray-300"
    >
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 0"
        class="px-3 py-1 rounded-md border dark:border-gray-700 disabled:opacity-50"
      >
        Prev
      </button>
      <span>Page {{ currentPage + 1 }} of {{ totalPages }}</span>
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage >= totalPages - 1"
        class="px-3 py-1 rounded-md border dark:border-gray-700 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../lib/api'

interface LeaveResponse {
  id: number
  employeeFirstName?: string
  employeeLastName?: string
  type: string
  startDate: string
  endDate: string
  reason?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

const leaves = ref<LeaveResponse[]>([])
const filters = ref({ employeeName: '', type: '', status: '' })
const currentPage = ref(0)
const totalPages = ref(1)
const loading = ref(false)
const alertMsg = ref('')

const typeLabels: Record<string, string> = {
  SICK: 'Sick Leave',
  VACATION: 'Annual Paid Leave',
  UNPAID: 'Annual Unpaid Leave'
}

function formatEmployeeName(first?: string, last?: string) {
  if (!first && !last) return '—'
  return `${first || ''} ${last || ''}`.trim()
}

function showMessage(msg: string) {
  alertMsg.value = msg
  setTimeout(() => (alertMsg.value = ''), 3000)
}

async function fetchLeaves(page = 0) {
  const managerId = localStorage.getItem('currentUserId')
  if (!managerId) return
  loading.value = true

  const params = new URLSearchParams()
  params.append('managerId', managerId)
  params.append('page', page.toString())
  params.append('size', '8')
  if (filters.value.employeeName) params.append('employeeName', filters.value.employeeName)
  if (filters.value.type) params.append('type', filters.value.type)
  if (filters.value.status) params.append('status', filters.value.status)

  try {
    const { data } = await api.get(`/api/v1/leaves?${params.toString()}`)
    leaves.value = data.content || []
    totalPages.value = data.totalPages || 1
    currentPage.value = data.number || 0
  } catch {
    showMessage('Failed to load team leaves.')
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  filters.value = { employeeName: '', type: '', status: '' }
  fetchLeaves(0)
}

async function approve(id: number) {
  try {
    await api.put(`/api/v1/leaves/${id}/approve`)
    leaves.value = leaves.value.map(l => (l.id === id ? { ...l, status: 'APPROVED' } : l))
    showMessage('Leave approved successfully.')
  } catch {
    showMessage('Failed to approve leave.')
  }
}

async function reject(id: number) {
  try {
    await api.put(`/api/v1/leaves/${id}/reject`)
    leaves.value = leaves.value.map(l => (l.id === id ? { ...l, status: 'REJECTED' } : l))
    showMessage('Leave rejected.')
  } catch {
    showMessage('Failed to reject leave.')
  }
}

function changePage(newPage: number) {
  if (newPage >= 0 && newPage < totalPages.value) {
    fetchLeaves(newPage)
  }
}

onMounted(() => fetchLeaves(0))
</script>
