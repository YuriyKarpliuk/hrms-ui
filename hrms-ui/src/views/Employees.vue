<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import api from "../lib/api"
import { getUserRoles } from "../services/authService"
import { useRouter } from "vue-router"
import type { Employee } from "../types/employee"

const router = useRouter()

const employees = ref<Employee[]>([])
const total = ref(0)
const page = ref(0)
const size = ref(10)
const search = ref("")
const status = ref("")
const gender = ref("")
const hiredFrom = ref("")
const hiredTo = ref("")
const loading = ref(false)
const error = ref("")
const showForm = ref(false)
const editingEmployee = ref<Employee | null>(null)

const roles = getUserRoles()
const isAdmin = computed(() => roles.includes("ADMIN"))
const isHR = computed(() => roles.includes("HR"))
const canEdit = computed(() => isAdmin.value || isHR.value)

const form = ref<Partial<Employee>>({
  orgId: 1,
  firstName: "",
  lastName: "",
  email: "",
  position: "",
  phone: "",
  status: "ACTIVE",
  gender: "MALE",
  maritalStatus: "SINGLE",
  officeLocation: "",
  about: "",
  avatarUrl: "",
})

async function loadEmployees() {
  loading.value = true
  error.value = ""
  try {
    const body = {
      firstName: search.value || null,
      firstNameMatchType: "CONTAINS",
      status: status.value || null,
      gender: gender.value || null,
      hiredFrom: hiredFrom.value || null,
      hiredTo: hiredTo.value || null,
    }
    const { data } = await api.post(
      `/api/v1/employees/search?page=${page.value}&size=${size.value}`,
      body
    )
    employees.value = data.content || []
    total.value = data.totalElements || 0
  } catch (err) {
    console.error(err)
    error.value = "Failed to load employees"
  } finally {
    loading.value = false
  }
}

onMounted(loadEmployees)
watch([page, size], loadEmployees)

function clearFilters() {
  search.value = ""
  status.value = ""
  gender.value = ""
  hiredFrom.value = ""
  hiredTo.value = ""
  loadEmployees()
}

function openAddForm() {
  editingEmployee.value = null
  form.value = {
    orgId: 1,
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    phone: "",
    status: "ACTIVE",
    gender: "MALE",
    maritalStatus: "SINGLE",
    officeLocation: "",
    about: "",
    avatarUrl: "",
  }
  showForm.value = true
}

function openEditForm(emp: Employee) {
  editingEmployee.value = emp
  form.value = { ...emp }
  showForm.value = true
}

async function saveEmployee() {
  try {
    if (editingEmployee.value?.id) {
      await api.put(`/api/v1/employees/${editingEmployee.value.id}`, form.value)
    } else {
      await api.post("/api/v1/employees", form.value)
    }
    showForm.value = false
    await loadEmployees()
  } catch (err) {
    console.error("Failed to save employee:", err)
    alert("Error saving employee")
  }
}

async function deleteEmployee(id: number) {
  if (!confirm("Are you sure you want to delete this employee?")) return
  await api.delete(`/api/v1/employees/${id}`)
  await loadEmployees()
}
</script>

<template>
  <div class="text-white p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold flex items-center gap-2 text-orange-400">👥 Employees</h1>
      <button
        v-if="canEdit"
        @click="openAddForm"
        class="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg shadow-lg transition"
      >
        + Add Employee
      </button>
    </div>

    <div class="grid md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <input
        v-model="search"
        placeholder="Search by first name"
        class="px-3 py-2 rounded bg-gray-800 border border-gray-600 text-sm"
        @keyup.enter="loadEmployees"
      />
      <select v-model="status" @change="loadEmployees" class="bg-gray-800 border border-gray-600 rounded p-2 text-sm">
        <option value="">All statuses</option>
        <option value="ACTIVE">ACTIVE</option>
        <option value="INACTIVE">INACTIVE</option>
        <option value="ON_LEAVE">ON LEAVE</option>
        <option value="TERMINATED">TERMINATED</option>
      </select>
      <select v-model="gender" @change="loadEmployees" class="bg-gray-800 border border-gray-600 rounded p-2 text-sm">
        <option value="">All genders</option>
        <option value="MALE">MALE</option>
        <option value="FEMALE">FEMALE</option>
      </select>
      <input type="date" v-model="hiredFrom" @change="loadEmployees" class="bg-gray-800 border border-gray-600 rounded p-2 text-sm" />
      <input type="date" v-model="hiredTo" @change="loadEmployees" class="bg-gray-800 border border-gray-600 rounded p-2 text-sm" />
      <div class="flex gap-2">
        <button @click="loadEmployees" class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm">Filter</button>
        <button @click="clearFilters" class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm text-gray-300">Clear</button>
      </div>
    </div>

    <div v-if="loading" class="text-gray-400 py-8 text-center">Loading employees...</div>
    <div v-else-if="error" class="text-red-400 py-8 text-center">{{ error }}</div>
    <div v-else>
      <div class="overflow-x-auto rounded-lg shadow-lg border border-gray-700">
        <table class="min-w-full bg-gray-800">
          <thead class="bg-gray-700 text-gray-200 text-sm uppercase">
            <tr>
              <th class="p-3 text-left">Employee</th>
              <th class="p-3 text-left">Email</th>
              <th class="p-3 text-left">Position</th>
              <th class="p-3 text-left">Gender</th>
              <th class="p-3 text-left">Status</th>
              <th class="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="emp in employees"
              :key="emp.id"
              @click="router.push(`/employees/${emp.id}`)"
              class="cursor-pointer hover:bg-gray-750 transition border-b border-gray-700"
            >
              <td class="p-3 flex items-center gap-3">
                <img :src="emp.avatarUrl || '/default-avatar.png'" class="w-8 h-8 rounded-full border border-gray-600" />
                <span>{{ emp.firstName }} {{ emp.lastName }}</span>
              </td>
              <td class="p-3 text-gray-300">{{ emp.email }}</td>
              <td class="p-3 text-gray-300">{{ emp.position }}</td>
              <td class="p-3">{{ emp.gender || "-" }}</td>
              <td class="p-3">
                <span
                  :class="{
                    'text-green-400': emp.status === 'ACTIVE',
                    'text-yellow-400': emp.status === 'ON_LEAVE',
                    'text-gray-400': emp.status === 'INACTIVE',
                    'text-red-400': emp.status === 'TERMINATED',
                  }"
                >
                  {{ emp.status }}
                </span>
              </td>
              <td class="p-3 text-right flex justify-end gap-3">
                <button v-if="canEdit" @click.stop="openEditForm(emp)" class="text-blue-400 hover:text-blue-300">✏️</button>
                <button v-if="isAdmin" @click.stop="deleteEmployee(emp.id)" class="text-red-400 hover:text-red-300">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-between items-center mt-4 text-gray-400 text-sm">
        <div class="flex items-center gap-4">
          <span>Rows per page:</span>
          <select v-model="size" class="bg-gray-800 border border-gray-600 rounded p-1 text-sm text-white">
            <option v-for="n in [5, 10, 20, 50]" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <button :disabled="page === 0" @click="page--" class="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded disabled:opacity-50">‹ Prev</button>
          <span>Page {{ page + 1 }} / {{ Math.ceil(total / size) || 1 }}</span>
          <button :disabled="(page + 1) * size >= total" @click="page++" class="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded disabled:opacity-50">Next ›</button>
        </div>
      </div>
    </div>

    <div v-if="showForm" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 w-[420px] animate-fadeIn">
        <h2 class="text-2xl font-bold mb-4 text-orange-400">
          {{ editingEmployee ? "Edit Employee" : "Add Employee" }}
        </h2>
        <div class="flex flex-col gap-3 overflow-y-auto max-h-[70vh] pr-2">
          <input v-model="form.firstName" placeholder="First name" class="p-2 bg-gray-700 rounded" />
          <input v-model="form.lastName" placeholder="Last name" class="p-2 bg-gray-700 rounded" />
          <input v-model="form.email" placeholder="Email" class="p-2 bg-gray-700 rounded" />
          <input v-model="form.position" placeholder="Position" class="p-2 bg-gray-700 rounded" />
          <input v-model="form.phone" placeholder="Phone" class="p-2 bg-gray-700 rounded" />
          <textarea v-model="form.about" placeholder="About" rows="2" class="p-2 bg-gray-700 rounded"></textarea>
          <input v-model="form.avatarUrl" placeholder="Avatar URL" class="p-2 bg-gray-700 rounded" />
          <select v-model="form.gender" class="p-2 bg-gray-700 rounded">
            <option value="MALE">MALE</option>
            <option value="FEMALE">FEMALE</option>
          </select>
          <select v-model="form.maritalStatus" class="p-2 bg-gray-700 rounded">
            <option value="SINGLE">SINGLE</option>
            <option value="MARRIED">MARRIED</option>
          </select>
          <select v-model="form.status" class="p-2 bg-gray-700 rounded">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="ON_LEAVE">ON LEAVE</option>
            <option value="TERMINATED">TERMINATED</option>
          </select>
          <label class="text-sm text-gray-400">Hired Date</label>
          <input type="date" v-model="form.hiredAt" class="p-2 bg-gray-700 rounded" />
          <label class="text-sm text-gray-400">Terminated Date</label>
          <input type="date" v-model="form.terminatedAt" class="p-2 bg-gray-700 rounded" />
          <input v-model="form.officeLocation" placeholder="Office Location" class="p-2 bg-gray-700 rounded" />
        </div>
        <div class="flex justify-end mt-5 gap-3">
          <button @click="showForm = false" class="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">Cancel</button>
          <button @click="saveEmployee" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
