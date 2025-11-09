<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import api from "../lib/api"
import type { Employee } from "../types/employee"

const route = useRoute()
const employee = ref<Employee | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get(`/api/v1/employees/${route.params.id}`)
    employee.value = data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="text-gray-400 p-8 text-center">Loading employee...</div>
  <div v-else-if="employee" class="text-white p-8">
    <div class="flex items-center gap-6 mb-8">
      <img :src="employee.avatarUrl || '/default-avatar.png'" class="w-28 h-28 rounded-full border-4 border-orange-500 shadow-xl" />
      <div>
        <h1 class="text-3xl font-bold text-orange-400">{{ employee.firstName }} {{ employee.lastName }}</h1>
        <p class="text-gray-300">{{ employee.position }}</p>
        <p class="text-gray-400 text-sm">{{ employee.email }}</p>
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <h2 class="text-lg font-semibold text-orange-400 mb-2">Personal Info</h2>
        <p><b>Gender:</b> {{ employee.gender }}</p>
        <p><b>Marital Status:</b> {{ employee.maritalStatus }}</p>
        <p><b>Phone:</b> {{ employee.phone }}</p>
        <p><b>Birth Date:</b> {{ employee.birthDate }}</p>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-orange-400 mb-2">Employment Info</h2>
        <p><b>Status:</b> {{ employee.status }}</p>
        <p><b>Department ID:</b> {{ employee.deptId }}</p>
        <p><b>Manager ID:</b> {{ employee.managerId }}</p>
        <p><b>Office:</b> {{ employee.officeLocation }}</p>
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-lg font-semibold text-orange-400 mb-2">About</h2>
      <p class="text-gray-300">{{ employee.about || "No description" }}</p>
    </div>
  </div>
</template>
