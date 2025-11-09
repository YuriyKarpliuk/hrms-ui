<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
    <h1 class="text-3xl font-extrabold text-orange-500 mb-6">My Leaves</h1>

    <div v-if="summary.length" class="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-x-auto mb-10">
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
    <div v-if="leaves.length" class="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-x-auto">
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
            <td class="py-3 px-5">{{ typeLabels[leave.type] }}</td>
            <td class="py-3 px-5">{{ leave.startDate }}</td>
            <td class="py-3 px-5">{{ leave.endDate }}</td>
            <td class="py-3 px-5">{{ leave.reason }}</td>
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
    </div>

    <p v-else class="text-gray-500 italic">No leave requests yet.</p>

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
  status: 'PENDING' | 'APPROVED' | 'REJECTED',
  reason: string
}

const employeeId = localStorage.getItem('currentUserId');
const summary = ref<LeaveSummary[]>([])
const leaves = ref<LeaveResponse[]>([])
const showModal = ref(false)
const selectedType = ref<LeaveSummary | null>(null)

const typeLabels: Record<string, string> = {
  SICK: 'Sick Leave',
  VACATION: 'Annual Paid Leave',
  UNPAID: 'Annual Unpaid Leave'
}

function openModal(t: LeaveSummary) {
  selectedType.value = t
  showModal.value = true
}

async function fetchAll() {
  if (!employeeId) return
  await Promise.all([fetchSummary(), fetchLeaves()])
}

async function fetchLeaves() {
  try {
    const { data } = await api.get<LeaveResponse[]>(`/api/v1/leaves/employee/${employeeId}`)
    leaves.value = data
  } catch (err) {
    console.error('Error loading leaves:', err)
  }
}

async function fetchSummary() {
  try {
    const { data } = await api.get<LeaveSummary[]>(`/api/v1/leaves/employee/${employeeId}/summary`)
    summary.value = data
  } catch (err) {
    console.error('Error loading summary:', err)
  }
}

onMounted(fetchAll)
</script>
