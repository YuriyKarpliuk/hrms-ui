<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6"
  >
    <div
      class="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-700"
    >
      <div
        class="flex justify-between items-center border-b border-gray-700 p-5"
      >
        <div>
          <h1 class="text-2xl font-bold text-orange-500">My Timesheets</h1>
          <p class="text-sm text-gray-400">
            Overview of your submitted timesheets
          </p>
        </div>
        <button
          @click="goToLogPage"
          class="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2"
        >
          <i class="fa-solid fa-plus"></i> Log Time
        </button>
      </div>

      <div
        class="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-gray-700"
      >
        <div v-if="isManagerOrAdmin">
          <label class="block text-sm mb-1">Employee ID</label>
          <input
            v-model="filters.employeeId"
            type="number"
            class="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label class="block text-sm mb-1">Start Date From</label>
          <input
            v-model="filters.startDateFrom"
            type="date"
            class="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label class="block text-sm mb-1">End Date To</label>
          <input
            v-model="filters.endDateTo"
            type="date"
            class="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label class="block text-sm mb-1">Status</label>
          <select
            v-model="filters.timesheetStatus"
            class="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">All</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div class="flex items-end gap-3">
          <button
            @click="clearFilters"
            class="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-5 py-2 rounded-lg w-full"
          >
            Clear Filters
          </button>
          <button
            @click="searchTimesheets"
            class="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg w-full"
          >
            Search
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-20 text-gray-400">
        Loading timesheets...
      </div>

      <div
        v-else-if="!timesheets.length"
        class="flex flex-col items-center justify-center text-center py-20 text-gray-500"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/7466/7466020.png"
          alt="Empty"
          class="w-32 mb-4 opacity-70"
        />
        <p>No timesheets found. Try adjusting filters.</p>
      </div>

      <div v-else class="p-6 overflow-x-auto">
        <table class="min-w-full border-collapse text-sm">
          <thead
            class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase"
          >
            <tr>
              <th class="py-3 px-4 text-left">#</th>
              <th class="py-3 px-4 text-left">Period</th>
              <th class="py-3 px-4 text-left">Total Entries</th>
              <th class="py-3 px-4 text-left">Status</th>
              <th class="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(t, i) in timesheets"
              :key="t.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-600 transition"
            >
              <td class="py-3 px-4">{{ i + 1 + (page - 1) * size }}</td>
              <td class="py-3 px-4">
                {{ formatDate(t.weekStart) }} — {{ formatDate(t.weekEnd) }}
              </td>
              <td class="py-3 px-4">{{ t.entries?.length || 0 }}</td>
              <td class="py-3 px-4">
                <span
                  class="px-3 py-1 text-xs font-semibold rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200':
                      t.timesheetStatus === 'DRAFT',
                    'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200':
                      t.timesheetStatus === 'SUBMITTED',
                    'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200':
                      t.timesheetStatus === 'APPROVED',
                    'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200':
                      t.timesheetStatus === 'REJECTED',
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200':
                      !t.timesheetStatus,
                  }"
                >
                  {{ t.timesheetStatus || "DRAFT" }}
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <button
                  @click="viewDetails(t.id)"
                  class="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg transition"
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="flex justify-between items-center mt-6">
          <button
            @click="prevPage"
            :disabled="page === 1"
            class="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-40"
          >
            Prev
          </button>
          <span class="text-gray-400">Page {{ page }} of {{ totalPages }}</span>
          <button
            @click="nextPage"
            :disabled="page === totalPages"
            class="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <transition name="fade">
        <div
          v-if="toast.visible"
          :class="[
            'fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300',
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600',
          ]"
        >
          {{ toast.message }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import api from "../lib/api";

interface Timesheet {
  id: number;
  weekStart: string;
  weekEnd: string;
  timesheetStatus: string;
  entries?: any[];
}

const router = useRouter();
const currentUserId = localStorage.getItem("currentUserId");
const isManagerOrAdmin =
  localStorage.getItem("roles")?.includes("MANAGER") ||
  localStorage.getItem("roles")?.includes("ADMIN");

const timesheets = ref<Timesheet[]>([]);
const totalPages = ref(1);
const loading = ref(true);
const page = ref(1);
const size = ref(5);

const filters = ref({
  employeeId: null as number | null,
  startDateFrom: "",
  endDateTo: "",
  timesheetStatus: "",
});

const toast = ref({
  visible: false,
  message: "",
  type: "success" as "success" | "error",
});

function showToast(msg: string, type: "success" | "error" = "success") {
  toast.value = { visible: true, message: msg, type };
  setTimeout(() => (toast.value.visible = false), 3000);
}
function clearFilters() {
  filters.value = {
    employeeId:  localStorage.getItem("currentUserId"),
    status: "",
    startDateFrom: "",
    startDateTo: "",
    endDateFrom: "",
    endDateTo: "",
  };
  searchTimesheets(); 
}

async function searchTimesheets() {
  loading.value = true;
  const employeeId = localStorage.getItem("currentUserId");
  try {
    const payload = {
      employeeId: employeeId,
      startDateFrom: filters.value.startDateFrom || null,
      endDateTo: filters.value.endDateTo || null,
      status: filters.value.timesheetStatus || "",
    };
    const { data } = await api.post(
      `/api/v1/timesheets/search?page=${page.value - 1}&size=${size.value}`,
      payload
    );
    timesheets.value = data.content;
    totalPages.value = data.totalPages;
  } catch (err) {
    console.error("Error searching timesheets:", err);
    showToast("Failed to search timesheets", "error");
  } finally {
    loading.value = false;
  }
}

async function fetchTimesheets() {
  if (!currentUserId) return;
  try {
    const { data } = await api.get(
      `/api/v1/timesheets/employee/${currentUserId}`
    );
    timesheets.value = data;
  } catch (err) {
    console.error("Error loading timesheets:", err);
    showToast("Failed to load timesheets", "error");
  } finally {
    loading.value = false;
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function goToLogPage() {
  router.push("/timesheets/logs");
}

function viewDetails(id: number) {
  router.push(`/timesheets/${id}`);
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++;
    searchTimesheets();
  }
}

function prevPage() {
  if (page.value > 1) {
    page.value--;
    searchTimesheets();
  }
}

onMounted(fetchTimesheets);
</script>
