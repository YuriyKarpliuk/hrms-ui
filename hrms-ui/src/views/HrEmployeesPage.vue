<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 p-6">
    <div class="max-w-7xl mx-auto">
      <header class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-extrabold text-orange-400">
            👥 Employees Management
          </h1>
          <p class="text-sm text-gray-400">
            Manage all employees in your organization.
          </p>
        </div>

        <button
          @click="goCreate"
          class="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold"
        >
          + Add Employee
        </button>
      </header>

      <div class="flex flex-wrap gap-4 mb-6 items-end">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search by name or email..."
          class="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm w-60"
        />

        <select
          v-model="filters.department"
          class="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm"
        >
          <option value="">All Departments</option>
          <option
            v-for="d in departments"
            :key="d.id"
            :value="d.id"
          >
            {{ d.name }}
          </option>
        </select>

        <select
          v-model="filters.status"
          class="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ON_LEAVE">On leave</option>
        </select>

        <button
          @click="fetchEmployees"
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-100"
        >
          Apply filters
        </button>
      </div>

      <div
        v-if="loading"
        class="text-center py-20 text-gray-400"
      >
        Loading employees...
      </div>

      <div v-else>
        <div
          class="bg-gray-800/70 border border-gray-700 rounded-xl overflow-hidden shadow-lg"
        >
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-800 border-b border-gray-700 text-gray-300">
              <tr>
                <th class="px-4 py-3">Employee</th>
                <th class="px-4 py-3">Department</th>
                <th class="px-4 py-3">Role</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="emp in employees"
                :key="emp.id"
                class="border-b border-gray-700 hover:bg-gray-700/40 transition"
              >
                <td class="px-4 py-3 flex items-center gap-3">
                  <img
                    :src="emp.avatarUrl || defaultAvatar"
                    class="w-10 h-10 rounded-full object-cover border border-gray-600"
                  />
                  <div>
                    <p class="font-semibold">{{ emp.firstName }} {{ emp.lastName }}</p>
                    <p class="text-xs text-gray-400">{{ emp.email }}</p>
                  </div>
                </td>

                <td class="px-4 py-3 text-gray-300">
                  {{ emp.departmentName || '—' }}
                </td>

                <td class="px-4 py-3 text-gray-300">
                  {{ emp.primaryRole || 'Employee' }}
                </td>

                <td class="px-4 py-3">
                  <span
                    :class="statusClass(emp.status)"
                    class="px-2 py-1 rounded-full text-xs font-semibold"
                  >
                    {{ emp.status }}
                  </span>
                </td>

                <td class="px-4 py-3 text-right">
                  <button
                    @click="goEdit(emp.id)"
                    class="px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-100"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../lib/api'

const router = useRouter()
const loading = ref(true)

const defaultAvatar = new URL('../../assets/images/default-avatar.png', import.meta.url).href

const employees = ref<any[]>([])
const departments = ref<any[]>([])

const filters = ref({
  search: '',
  status: '',
  department: ''
})

async function fetchEmployees() {
  loading.value = true
  const { data } = await api.get('/api/v1/hr/employees', { params: filters.value })
  employees.value = data
  loading.value = false
}

async function fetchDepartments() {
  const { data } = await api.get('/api/v1/departments')
  departments.value = data
}

function goCreate() {
  router.push('/hr/employees/create')
}

function goEdit(id: number) {
  router.push(`/hr/employees/${id}/edit`)
}

function statusClass(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-700/40 text-green-300'
    case 'INACTIVE':
      return 'bg-red-700/40 text-red-300'
    case 'ON_LEAVE':
      return 'bg-yellow-700/40 text-yellow-300'
    default:
      return 'bg-gray-700 text-gray-300'
  }
}

onMounted(async () => {
  await fetchDepartments()
  await fetchEmployees()
})
</script>
