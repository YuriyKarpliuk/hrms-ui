<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
    <h1 class="text-3xl font-extrabold text-orange-500 mb-6">Employees Directory</h1>

    <div class="flex flex-wrap gap-4 mb-6 items-end">
      <input
        v-model="filters.name"
        type="text"
        placeholder="Search by name or email..."
        class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
      />

      <select
        v-model="filters.status"
        class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
      >
        <option value="">All Statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="ON_LEAVE">On Leave</option>
        <option value="INACTIVE">Inactive</option>
        <option value="TERMINATED">Terminated</option>
      </select>

      <select
        v-model="filters.gender"
        class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
      >
        <option value="">All Genders</option>
        <option value="MALE">Male</option>
        <option value="FEMALE">Female</option>
      </select>

      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-500 dark:text-gray-400">Hired From</label>
        <input
          type="date"
          v-model="filters.hiredFrom"
          class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
        />
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-500 dark:text-gray-400">Hired To</label>
        <input
          type="date"
          v-model="filters.hiredTo"
          class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
        />
      </div>

      <button
        @click="searchEmployees(0)"
        class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition"
      >
        Search
      </button>
      <button
        @click="clearFilters"
        class="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-5 py-2 rounded-lg"
      >
        Clear Filters
      </button>
    </div>

    <div v-if="loading" class="text-center text-gray-400 py-10">
      Loading employees...
    </div>

    <div
      v-else-if="employees.length"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-x-auto border border-gray-200 dark:border-gray-700"
    >
      <table class="min-w-full border-collapse text-sm">
        <thead class="bg-gray-100 dark:bg-gray-700 text-left">
          <tr>
            <th class="py-3 px-5">#</th>
            <th class="py-3 px-5">Name</th>
            <th class="py-3 px-5">Email</th>
            <th class="py-3 px-5">Position</th>
            <th class="py-3 px-5">Department</th>
            <th class="py-3 px-5">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(emp, i) in employees"
            :key="emp.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
            @click="viewEmployee(emp.id)"
          >
            <td class="py-3 px-5">{{ i + 1 + currentPage * size }}</td>
            <td class="py-3 px-5 font-medium flex items-center gap-2">
              <img
                :src="emp.avatarUrl || '/default-avatar.png'"
                class="w-8 h-8 rounded-full object-cover"
                alt="avatar"
              />
              {{ emp.firstName }} {{ emp.lastName }}
            </td>
            <td class="py-3 px-5">{{ emp.email }}</td>
            <td class="py-3 px-5">{{ emp.position || '—' }}</td>
            <td class="py-3 px-5">{{ emp.departmentName || '—' }}</td>
            <td class="py-3 px-5">
              <span
                class="px-3 py-1 text-xs font-semibold rounded-full"
                :class="statusColor(emp.status)"
              >
                {{ emp.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-gray-500 italic">No employees found.</p>

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
import { useRouter } from 'vue-router'
import api from '../lib/api'

interface Employee {
  id: number
  firstName: string
  lastName: string
  email: string
  position?: string
  departmentName?: string
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED'
  avatarUrl?: string
}

const router = useRouter()
const employees = ref<Employee[]>([])
const loading = ref(false)
const totalPages = ref(1)
const currentPage = ref(0)
const size = 8

const filters = ref({
  name: '',
  status: '',
  gender: '',
  hiredFrom: '',
  hiredTo: ''
})

async function searchEmployees(page = 0) {
  loading.value = true
  try {
    const payload = {
      firstName: filters.value.name || null,
      lastName: filters.value.name || null,
      email: filters.value.name || null,
      status: filters.value.status || null,
      gender: filters.value.gender || null,
      hiredFrom: filters.value.hiredFrom || null,
      hiredTo: filters.value.hiredTo || null
    }

    const employeeId = localStorage.getItem('currentUserId')
    const { data } = await api.post(
      `/api/v1/employees/search/${employeeId}?page=${page}&size=${size}`,
      payload
    )

    employees.value = data.content || []
    totalPages.value = data.totalPages || 1
    currentPage.value = data.number || 0
  } catch (err) {
    console.error('Error loading employees:', err)
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  filters.value = { name: '', status: '', gender: '', hiredFrom: '', hiredTo: '' }
  searchEmployees(0)
}

function changePage(newPage: number) {
  if (newPage >= 0 && newPage < totalPages.value) {
    searchEmployees(newPage)
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200'
    case 'ON_LEAVE':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200'
    case 'TERMINATED':
      return 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
}

function viewEmployee(id: number) {
  router.push(`/search/employees/${id}`)
}

onMounted(() => searchEmployees(0))
</script>
