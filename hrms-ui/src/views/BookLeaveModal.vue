<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-md relative">
      <h2 class="text-xl font-bold text-orange-500 mb-4">
        Book {{ props.type ? typeLabels[props.type.type] : 'Leave' }}
      </h2>

      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label class="block text-sm mb-1 font-medium">Start Date</label>
          <input
            v-model="startDate"
            type="date"
            class="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <label class="block text-sm mb-1 font-medium">End Date</label>
          <input
            v-model="endDate"
            type="date"
            class="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <label class="block text-sm mb-1 font-medium">Reason (optional)</label>
          <textarea
            v-model="reason"
            placeholder="Write a short reason..."
            rows="3"
            class="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          ></textarea>
        </div>

        <p v-if="errorMessage" class="text-red-500 text-sm font-medium">{{ errorMessage }}</p>

        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !isFormValid"
            class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition disabled:opacity-60"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import api from '../lib/api'

interface LeaveSummary {
  type: string
  total: number
  used: number
}

const props = defineProps<{
  type: LeaveSummary | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'booked'): void
}>()

const startDate = ref('')
const endDate = ref('')
const reason = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

const typeLabels: Record<string, string> = {
  SICK: 'Sick Leave',
  VACATION: 'Annual Paid Leave',
  UNPAID: 'Annual Unpaid Leave'
}

const isFormValid = computed(() => {
  if (!startDate.value || !endDate.value || !props.type) return false
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  return end >= start
})

async function submitForm() {
  errorMessage.value = ''

  const employeeId = localStorage.getItem('currentUserId');
  if (!employeeId) {
    errorMessage.value = 'User ID not found in token'
    return
  }

  if (!props.type) {
    errorMessage.value = 'Please select a leave type'
    return
  }

  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  if (end < start) {
    errorMessage.value = 'End date must be after start date'
    return
  }

  const payload = {
    employeeId,
    type: props.type.type,
    startDate: startDate.value,
    endDate: endDate.value,
    reason: reason.value,
  }

  try {
    isSubmitting.value = true
    await api.post(`/api/v1/leaves`, payload)
    emit('booked')
    emit('close')
  } catch (err: any) {
    console.error('Error submitting leave request:', err)
    errorMessage.value =
      err.response?.data?.message || 'Error submitting leave request!'
  } finally {
    isSubmitting.value = false
  }
}
</script>
