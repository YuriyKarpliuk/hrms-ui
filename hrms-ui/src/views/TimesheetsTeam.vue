<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
    <h1 class="text-3xl font-extrabold text-orange-500 mb-6">Team Timesheets</h1>

    <div class="flex flex-wrap gap-4 mb-6 items-end">
      <input
        v-model="filters.employeeName"
        type="text"
        placeholder="Search by employee name..."
        class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
      />

      <select
        v-model="filters.status"
        class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
      >
        <option value="">All Statuses</option>
        <option value="SUBMITTED">Submitted</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
      </select>

      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-500 dark:text-gray-400">From</label>
        <input
          type="date"
          v-model="filters.weekStartFrom"
          class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
        />
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-500 dark:text-gray-400">To</label>
        <input
          type="date"
          v-model="filters.weekEndTo"
          class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
        />
      </div>

      <button
        @click="fetchTimesheets(0)"
        class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition"
      >
        Filter
      </button>
      <button
        @click="clearFilters"
        class="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-5 py-2 rounded-lg"
      >
        Clear Filters
      </button>
    </div>

    <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 py-10">
      Loading team timesheets...
    </div>

    <div
      v-else-if="timesheets.length"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-x-auto border border-gray-200 dark:border-gray-700"
    >
      <table class="min-w-full border-collapse">
        <thead class="bg-gray-100 dark:bg-gray-700 text-left">
          <tr>
            <th class="py-3 px-5">Employee</th>
            <th class="py-3 px-5">Week Start</th>
            <th class="py-3 px-5">Week End</th>
            <th class="py-3 px-5">Total Hours</th>
            <th class="py-3 px-5">Status</th>
            <th class="py-3 px-5 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="ts in timesheets"
            :key="ts.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
            @click="viewDetails(ts.id)"
          >
            <td class="py-3 px-5 font-medium">
              {{ ts.employeeFirstName }} {{ ts.employeeLastName }}
            </td>
            <td class="py-3 px-5">{{ ts.weekStart }}</td>
            <td class="py-3 px-5">{{ ts.weekEnd }}</td>
            <td class="py-3 px-5">{{ ts.totalHours ?? "—" }}</td>
            <td class="py-3 px-5">
              <span
                class="px-3 py-1 text-xs font-semibold rounded-full"
                :class="{
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200': ts.status === 'SUBMITTED',
                  'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200': ts.status === 'APPROVED',
                  'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200': ts.status === 'REJECTED',
                }"
              >
                {{ ts.status }}
              </span>
            </td>
            <td class="py-3 px-5 text-center space-x-2" @click.stop>
              <button
                v-if="ts.status === 'SUBMITTED'"
                @click="approve(ts.id)"
                class="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded-lg transition"
              >
                Approve
              </button>
              <button
                v-if="ts.status === 'SUBMITTED'"
                @click="reject(ts.id)"
                class="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded-lg transition"
              >
                Reject
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-gray-500 italic">No team timesheets found.</p>
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
import { ref, onMounted } from "vue";
import api from "../lib/api";
import { useRouter } from "vue-router";

interface Timesheet {
  id: number;
  employeeFirstName?: string;
  employeeLastName?: string;
  weekStart: string;
  weekEnd: string;
  totalHours?: number;
  status: "SUBMITTED" | "APPROVED" | "REJECTED";
}

const router = useRouter();
const timesheets = ref<Timesheet[]>([]);
const filters = ref({
  employeeName: "",
  status: "",
  weekStartFrom: "",
  weekEndTo: "",
});
const currentPage = ref(0);
const totalPages = ref(1);
const loading = ref(false);

function viewDetails(id: number) {
  router.push(`/timesheets/team/${id}`);
}

async function fetchTimesheets(page = 0) {
  const managerId = localStorage.getItem("currentUserId");
  if (!managerId) return;
  loading.value = true;

  const params = new URLSearchParams();
  params.append("managerId", managerId);
  params.append("page", page.toString());
  params.append("size", "8");
  if (filters.value.employeeName)
    params.append("employeeName", filters.value.employeeName);
  if (filters.value.status) params.append("status", filters.value.status);
  if (filters.value.weekStartFrom)
    params.append("weekStartFrom", filters.value.weekStartFrom);
  if (filters.value.weekEndTo)
    params.append("weekEndTo", filters.value.weekEndTo);

  try {
    const { data } = await api.get(`/api/v1/timesheets/team?${params.toString()}`);
    timesheets.value = data.content || [];
    totalPages.value = data.totalPages || 1;
    currentPage.value = data.number || 0;
  } finally {
    loading.value = false;
  }
}

function clearFilters() {
  filters.value = { employeeName: "", status: "", weekStartFrom: "", weekEndTo: "" };
  fetchTimesheets(0);
}

async function approve(id: number) {
  await api.put(`/api/v1/timesheets/${id}/approve`);
  timesheets.value = timesheets.value.map((t) =>
    t.id === id ? { ...t, status: "APPROVED" } : t
  );
}

async function reject(id: number) {
  await api.put(`/api/v1/timesheets/${id}/reject`);
  timesheets.value = timesheets.value.map((t) =>
    t.id === id ? { ...t, status: "REJECTED" } : t
  );
}

function changePage(newPage: number) {
  if (newPage >= 0 && newPage < totalPages.value) fetchTimesheets(newPage);
}

onMounted(() => fetchTimesheets(0));
</script>
