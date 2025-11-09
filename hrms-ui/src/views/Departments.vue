<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-extrabold text-orange-500">Departments</h1>
        <p class="text-gray-500 dark:text-gray-400">Manage your company departments</p>
      </div>
      <button
        @click="openAddModal"
        class="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold shadow transition">
        + Add Department
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-x-auto">
      <table class="min-w-full border-collapse">
        <thead class="bg-gray-100 dark:bg-gray-700 text-left">
          <tr>
            <th class="py-3 px-5">#</th>
            <th class="py-3 px-5">Department</th>
            <th class="py-3 px-5">Head</th>
            <th class="py-3 px-5">Employees</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(dept, i) in departments" :key="dept.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <td class="py-3 px-5">{{ i + 1 }}</td>
            <td class="py-3 px-5 font-semibold">{{ dept.name }}</td>
            <td class="py-3 px-5">{{ dept.head }}</td>
            <td class="py-3 px-5">{{ dept.employees }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4 text-orange-500">Add Department</h2>
        <form @submit.prevent="addDepartment" class="space-y-4">
          <input v-model="newDept.name" placeholder="Department name"
                 class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"/>
          <input v-model="newDept.head" placeholder="Department head"
                 class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"/>
          <button class="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg">Save</button>
        </form>
        <button @click="showModal=false" class="mt-4 w-full text-sm text-gray-400 underline">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const departments = ref([
  { id: 1, name: 'Engineering', head: 'Alice Johnson', employees: 14 },
  { id: 2, name: 'Finance', head: 'Bob Smith', employees: 8 },
  { id: 3, name: 'HR', head: 'Charlie Brown', employees: 5 },
])
const showModal = ref(false)
const newDept = ref({ name: '', head: '' })
const openAddModal = () => (showModal.value = true)
const addDepartment = () => {
  if (!newDept.value.name) return
  departments.value.push({
    id: departments.value.length + 1,
    name: newDept.value.name,
    head: newDept.value.head,
    employees: 0,
  })
  newDept.value = { name: '', head: '' }
  showModal.value = false
}
</script>
