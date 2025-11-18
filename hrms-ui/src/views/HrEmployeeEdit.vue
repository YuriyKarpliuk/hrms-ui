<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import api from "../lib/api"

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref("")

const id = Number(route.params.id)

const currentOrgId = ref<number | null>(null)
const employeeId = localStorage.getItem("currentUserId")

const form = ref({
  deptId: null,
  orgId: null as number | null,
  managerId: null,
  hrId: employeeId,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  status: "ACTIVE",
  gender: "MALE",
  maritalStatus: "SINGLE",
  officeLocation: "",
  about: "",
  birthDate: "",
  hiredAt: "",
  terminatedAt: "",
  roleNames: [] as string[],
})

const departments = ref<any[]>([])
const managers = ref<any[]>([])
const roles = ["USER", "MANAGER", "HR"]

async function loadDepsAndManagers() {
  const { data: deps } = await api.get("/api/v1/departments")
  const { data: mgrs } = await api.get("/api/v1/employees/managers")
  departments.value = deps
  managers.value = mgrs
}

async function loadCurrentUserOrg() {
  const { data } = await api.get("/api/v1/employees/me")
  currentOrgId.value = data.orgId || data.organization?.id
}

async function loadEmployee() {
  try {
    loading.value = true

    const { data } = await api.get(`/api/v1/employees/${id}`)

    form.value = {
      deptId: data.deptId,
      orgId: data.orgId,
      managerId: data.managerId,
      hrId: employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      position: data.position,
      status: data.status,
      gender: data.gender,
      maritalStatus: data.maritalStatus,
      officeLocation: data.officeLocation,
      about: data.about,
      birthDate: data.birthDate,
      hiredAt: data.hiredAt,
      terminatedAt: data.terminatedAt,
      roleNames: data.roles ?? [],
    }
  } catch (err) {
    console.error(err)
    error.value = "Failed to load employee"
  } finally {
    loading.value = false
  }
}

async function save() {
  loading.value = true
  error.value = ""

  form.value.orgId = currentOrgId.value

  try {
    await api.put(`/api/v1/employees/${id}`, form.value)
    router.push("/hr/employees")
  } catch (err) {
    console.error(err)
    error.value = "Failed to save employee"
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCurrentUserOrg()
  await loadDepsAndManagers()
  await loadEmployee()
})
</script>

<template>
  <div class="p-6 text-white max-w-4xl mx-auto">
    <h1 class="text-3xl text-orange-400 font-bold mb-6">✏️ Edit Employee</h1>

    <div v-if="error" class="text-red-400 mb-4">{{ error }}</div>

    <div class="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
      <div class="grid md:grid-cols-2 gap-4">
        <input v-model="form.firstName" placeholder="First Name" class="input" />
        <input v-model="form.lastName" placeholder="Last Name" class="input" />
        <input v-model="form.email" placeholder="Email" class="input" />
        <input v-model="form.phone" placeholder="Phone" class="input" />
        <input v-model="form.position" placeholder="Position" class="input" />
        <input v-model="form.officeLocation" placeholder="Office Location" class="input" />
      </div>

      <textarea v-model="form.about" placeholder="About" class="input"></textarea>

      <div class="grid md:grid-cols-3 gap-4">
        <select v-model="form.status" class="input">
          <option>ACTIVE</option>
          <option>ON_LEAVE</option>
          <option>INACTIVE</option>
          <option>TERMINATED</option>
        </select>

        <select v-model="form.gender" class="input">
          <option>MALE</option>
          <option>FEMALE</option>
        </select>

        <select v-model="form.maritalStatus" class="input">
          <option>SINGLE</option>
          <option>MARRIED</option>
        </select>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <input type="date" v-model="form.birthDate" class="input" />
        <input type="date" v-model="form.hiredAt" class="input" />
        <input type="date" v-model="form.terminatedAt" class="input" />
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <select v-model="form.deptId" class="input">
          <option disabled value="">Select Department</option>
          <option v-for="d in departments" :key="d.id" :value="d.id">
            {{ d.name }}
          </option>
        </select>

        <select v-model="form.managerId" class="input">
          <option value="">No manager</option>
          <option v-for="m in managers" :key="m.id" :value="m.id">
            {{ m.firstName }} {{ m.lastName }}
          </option>
        </select>
      </div>

      <div>
        <p class="text-sm text-gray-400 mb-1">Roles</p>
        <div class="flex gap-4">
          <label class="flex gap-2">
            <input type="checkbox" value="USER" v-model="form.roleNames" /> USER
          </label>
          <label class="flex gap-2">
            <input type="checkbox" value="MANAGER" v-model="form.roleNames" /> MANAGER
          </label>
          <label class="flex gap-2">
            <input type="checkbox" value="HR" v-model="form.roleNames" /> HR
          </label>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button @click="router.back()" class="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg">
          Cancel
        </button>
        <button @click="save" class="px-5 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg shadow-lg">
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input {
  @apply bg-gray-700 border border-gray-600 p-2 rounded text-sm w-full;
}
</style>
