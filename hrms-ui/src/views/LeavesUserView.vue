<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
    <h1 class="text-3xl font-extrabold text-orange-500 mb-6">My Leaves</h1>

    <div v-if="summary.length" class="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-x-auto mb-10 border border-gray-200 dark:border-gray-700">
      <table class="min-w-full border-collapse">
        <thead class="bg-gray-100 dark:bg-gray-700 text-left">
          <tr>
            <th class="py-3 px-5">Type</th>
            <th class="py-3 px-5">Total Days / Year</th>
            <th class="py-3 px-5">Used</th>
            <th class="py-3 px-5">Remaining</th>
            <th class="py-3 px-5 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="t in summary"
            :key="t.type"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <td class="py-3 px-5 font-medium">{{ typeLabels[t.type] }}</td>
            <td class="py-3 px-5">{{ t.total }}</td>
            <td class="py-3 px-5">{{ t.used }}</td>
            <td class="py-3 px-5">{{ t.total - t.used }}</td>
            <td class="py-3 px-5 text-center">
              <button
                @click="openModal(t)"
                class="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition"
                :disabled="t.total - t.used <= 0"
              >
                Book Leave
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 class="text-2xl font-bold text-orange-400 mb-3">My Requests</h2>

    <div class="flex flex-wrap gap-4 mb-6 items-end">
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
        @click="searchLeaves"
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
      Loading leaves...
    </div>

    <div v-else-if="!leaves.length" class="text-gray-500 italic text-center py-10">
      No leave requests found.
    </div>

    <div
      v-else
      class="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-x-auto border border-gray-200 dark:border-gray-700"
    >
      <table class="min-w-full border-collapse">
        <thead class="bg-gray-100 dark:bg-gray-700 text-left">
          <tr>
            <th class="py-3 px-5">Type</th>
            <th class="py-3 px-5">From</th>
            <th class="py-3 px-5">To</th>
            <th class="py-3 px-5">Reason</th>
            <th class="py-3 px-5">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="leave in leaves"
            :key="leave.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <td class="py-3 px-5">{{ typeLabels[leave.type] || leave.type }}</td>
            <td class="py-3 px-5">{{ formatDate(leave.startDate) }}</td>
            <td class="py-3 px-5">{{ formatDate(leave.endDate) }}</td>
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
          </tr>
        </tbody>
      </table>

      <div
        v-if="totalPages > 1"
        class="flex justify-center items-center mt-6 mb-4 gap-3 text-sm text-gray-700 dark:text-gray-300"
      >
        <button
          @click="prevPage"
          :disabled="page === 1"
          class="px-3 py-1 rounded-md border dark:border-gray-700 disabled:opacity-50"
        >
          Prev
        </button>
        <span>Page {{ page }} of {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="page === totalPages"
          class="px-3 py-1 rounded-md border dark:border-gray-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>

    <BookLeaveModal
      v-if="showModal"
      :type="selectedType"
      @close="showModal = false"
      @booked="fetchAll"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BookLeaveModal from './BookLeaveModal.vue'
import api from '../lib/api'

interface LeaveSummary {
  type: string
  total: number
  used: number
}

interface LeaveResponse {
  id: number
  type: string
  startDate: string
  endDate: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reason: string
}

const employeeId = localStorage.getItem('currentUserId')
const summary = ref<LeaveSummary[]>([])
const leaves = ref<LeaveResponse[]>([])
const showModal = ref(false)
const selectedType = ref<LeaveSummary | null>(null)
const loading = ref(true)
const page = ref(1)
const size = ref(5)
const totalPages = ref(1)

const filters = ref({
  type: '',
  status: '',
  startFrom: '',
  endTo: ''
})

const typeLabels: Record<string, string> = {
  SICK: 'Sick Leave',
  VACATION: 'Annual Paid Leave',
  UNPAID: 'Annual Unpaid Leave'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  })
}

function openModal(t: LeaveSummary) {
  selectedType.value = t
  showModal.value = true
}

async function fetchSummary() {
  try {
    const { data } = await api.get(`/api/v1/leaves/employee/${employeeId}/summary`)
    summary.value = data
  } catch (err) {
    console.error('Error loading summary:', err)
  }
}

async function searchLeaves() {
  loading.value = true
  try {
    const payload = {
      employeeId,
      type: filters.value.type || null,
      status: filters.value.status || null,
      startFrom: filters.value.startFrom || null,
      endTo: filters.value.endTo || null
    }
    const { data } = await api.post(
      `/api/v1/leaves/search?page=${page.value - 1}&size=${size.value}`,
      payload
    )
    leaves.value = data.content
    totalPages.value = data.totalPages
  } catch (err) {
    console.error('Error searching leaves:', err)
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  filters.value = { type: '', status: '', startFrom: '', endTo: '' }
  page.value = 1
  searchLeaves()
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++
    searchLeaves()
  }
}

function prevPage() {
  if (page.value > 1) {
    page.value--
    searchLeaves()
  }
}

async function fetchAll() {
  await Promise.all([fetchSummary(), searchLeaves()])
}

onMounted(fetchAll)
</script>
