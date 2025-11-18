<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import api from "../lib/api"

type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED"
type TaskType = "ONBOARDING" | "OFFBOARDING" | "REVIEW" | "LEAVE_APPROVAL" | "CUSTOM"

interface HrTask {
  id: number
  employeeId: number
  createdBy: number
  title: string
  description?: string
  type: TaskType
  status: TaskStatus
  dueDate?: string | null
  createdAt: string
  completedAt?: string | null
}

const route = useRoute()
const task = ref<HrTask | null>(null)
const loading = ref(true)

function formatDate(date?: string | null) {
  if (!date) return "—"
  return new Date(date).toLocaleDateString()
}

onMounted(async () => {
  try {
    const { id } = route.params
    const { data } = await api.get(`/api/v1/hr/tasks/${id}`)
    task.value = data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="text-gray-400 p-8 text-center">
    Loading task...
  </div>
  <div v-else-if="task" class="text-white p-8">
    <h1 class="text-3xl font-bold text-orange-400 mb-4">
      Task #{{ task.id }} – {{ task.title }}
    </h1>

    <div class="grid md:grid-cols-2 gap-6 text-sm">
      <div>
        <h2 class="text-lg font-semibold text-orange-400 mb-2">General</h2>
        <p><b>Status:</b> {{ task.status }}</p>
        <p><b>Type:</b> {{ task.type }}</p>
        <p><b>Employee ID:</b> {{ task.employeeId }}</p>
        <p><b>Created by (HR ID):</b> {{ task.createdBy }}</p>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-orange-400 mb-2">Dates</h2>
        <p><b>Due date:</b> {{ formatDate(task.dueDate) }}</p>
        <p><b>Created at:</b> {{ formatDate(task.createdAt) }}</p>
        <p><b>Completed at:</b> {{ formatDate(task.completedAt) }}</p>
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-lg font-semibold text-orange-400 mb-2">Description</h2>
      <p class="text-gray-300 whitespace-pre-line">
        {{ task.description || "No description" }}
      </p>
    </div>
  </div>
</template>
