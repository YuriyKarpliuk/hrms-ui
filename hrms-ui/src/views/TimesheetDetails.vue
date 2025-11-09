<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6"
  >
    <div
      class="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-700"
    >
      <div
        class="flex justify-between items-center border-b border-gray-700 p-5"
      >
        <div>
          <h1 class="text-2xl font-bold text-orange-500">Timesheet Details</h1>
          <p class="text-sm text-gray-400">
            {{ formatDate(timesheet?.weekStart) }} —
            {{ formatDate(timesheet?.weekEnd) }}
          </p>
        </div>
        <button @click="goBack" class="btn-gray">← Back</button>
      </div>

      <div v-if="loading" class="text-center py-20 text-gray-400">
        Loading...
      </div>

      <div v-else-if="!timesheet" class="text-center py-20 text-gray-500">
        Timesheet not found.
      </div>

      <div v-else class="p-6">
        <div class="mb-4 flex justify-between items-center">
          <div class="text-sm">
            <strong>Status:</strong>
            <span
              class="ml-2 px-3 py-1 text-xs font-semibold rounded-full"
              :class="{
                'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200':
                  timesheet.status === 'APPROVED',
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200':
                  timesheet.status === 'DRAFT',
                'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200':
                  timesheet.status === 'REJECTED',
              }"
            >
              {{ timesheet.status }}
            </span>
          </div>
          <div class="text-sm text-gray-400">
            Total entries: {{ timesheet.entries?.length }}
          </div>
        </div>

        <table class="min-w-full border-collapse text-sm">
          <thead
            class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase"
          >
            <tr>
              <th class="py-3 px-4 text-left">Date</th>
              <th class="py-3 px-4 text-left">Activity Type</th>
              <th class="py-3 px-4 text-left">Notes</th>
              <th class="py-3 px-4 text-center">Hours</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="e in timesheet.entries"
              :key="e.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-600 transition"
            >
              <td class="py-3 px-4 font-medium">
                {{ formatDate(e.workDate) }}
              </td>
              <td class="py-3 px-4">{{ e.activityType }}</td>
              <td class="py-3 px-4">{{ e.notes || "-" }}</td>
              <td class="py-3 px-4 text-center">{{ e.hours }}</td>
            </tr>
          </tbody>
        </table>

        <div
          class="text-right mt-4 font-semibold text-gray-600 dark:text-gray-300"
        >
          Total hours: {{ totalHours }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../lib/api";

const route = useRoute();
const router = useRouter();
const timesheetId = route.params.id;
const timesheet = ref<any>(null);
const loading = ref(true);

async function fetchDetails() {
  try {
    const { data } = await api.get(`/api/v1/timesheets/${timesheetId}`);
    timesheet.value = data;
  } catch (err) {
    console.error("Error fetching timesheet:", err);
  } finally {
    loading.value = false;
  }
}

function formatDate(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}
function goBack() {
  router.push("/timesheets");
}

const totalHours = computed(
  () =>
    timesheet.value?.entries?.reduce(
      (sum: number, e: any) => sum + (e.hours || 0),
      0
    ) || 0
);

onMounted(fetchDetails);
</script>

<style scoped>
.btn-gray { @apply px-4 py-2 bg-gray-600 hover:bg-gray-500}

.btn-gray { @apply px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition; }
</style>
