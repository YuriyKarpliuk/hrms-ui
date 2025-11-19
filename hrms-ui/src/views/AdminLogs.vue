<template>
  <div class="min-h-screen bg-gray-900 text-white p-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-orange-500">System Logs</h1>
        <p class="text-sm text-gray-400">Monitoring application events and errors</p>
      </div>
    </div>

    <div class="grid md:grid-cols-4 gap-4 mb-6">
      <div>
        <label class="label">Search</label>
        <input v-model="filters.query" class="input" @keyup.enter="loadLogs" placeholder="Message or service" />
      </div>

      <div>
        <label class="label">Level</label>
        <select v-model="filters.level" class="input" @change="loadLogs">
          <option value="">All Levels</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
        </select>
      </div>

      <div>
        <label class="label">Service</label>
        <input v-model="filters.service" class="input" @keyup.enter="loadLogs" placeholder="employee-service" />
      </div>

      <div class="flex items-end gap-2">
        <button @click="loadLogs" class="btn-gray px-4 w-full">Apply</button>
        <button @click="clearFilters" class="btn-gray px-4 w-full">Clear</button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10 text-gray-400">Loading...</div>

    <div v-else class="bg-gray-800 border border-gray-700 rounded-2xl shadow overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-700">
          <tr>
            <th class="th">Timestamp</th>
            <th class="th">Level</th>
            <th class="th">Service</th>
            <th class="th">Message</th>
            <th class="th text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="log in logs" :key="log.id" class="tr">
            <td class="td">{{ formatDate(log.timestamp) }}</td>
            <td class="td">
              <span :class="levelClass(log.level)" class="px-2 py-1 rounded text-xs">
                {{ log.level }}
              </span>
            </td>
            <td class="td">{{ log.service }}</td>
            <td class="td truncate max-w-[350px]">{{ log.message }}</td>
            <td class="td text-right">
              <button @click="openModal(log)" class="text-orange-400 hover:text-orange-300">
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center gap-4 mt-6 text-sm">
      <button class="btn-gray" :disabled="page === 0" @click="changePage(page - 1)">Prev</button>
      <span>Page {{ page + 1 }} / {{ totalPages }}</span>
      <button class="btn-gray" :disabled="page >= totalPages - 1" @click="changePage(page + 1)">Next</button>
    </div>

    <div v-if="modalLog" class="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50">
      <div class="bg-gray-900 border border-gray-700 rounded-xl p-6 w-[600px] shadow-xl">
        <h3 class="text-xl font-bold text-orange-400 mb-4">Log Details</h3>

        <div class="space-y-3 text-sm">
          <div>
            <span class="text-gray-400">Timestamp:</span>
            <span class="ml-2">{{ formatDate(modalLog.timestamp) }}</span>
          </div>

          <div>
            <span class="text-gray-400">Level:</span>
            <span :class="['ml-2 px-2 py-1 rounded text-xs', levelClass(modalLog.level)]">
              {{ modalLog.level }}
            </span>
          </div>

          <div>
            <span class="text-gray-400">Service:</span>
            <span class="ml-2">{{ modalLog.service }}</span>
          </div>

          <div>
            <span class="text-gray-400">Message:</span>
            <p class="mt-1 bg-gray-800 border border-gray-700 p-3 rounded-xl whitespace-pre-wrap">
              {{ modalLog.message }}
            </p>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button @click="modalLog = null" class="btn-gray px-4">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../lib/api";

const logs = ref([]);
const loading = ref(false);
const page = ref(0);
const size = 12;
const totalPages = ref(1);

const modalLog = ref(null);

const filters = ref({
  query: "",
  level: "",
  service: ""
});

function levelClass(level: string) {
  if (level === "ERROR") return "bg-red-600";
  if (level === "WARN") return "bg-yellow-600";
  return "bg-gray-600";
}

function formatDate(d: string) {
  return new Date(d).toLocaleString();
}

async function loadLogs() {
  loading.value = true;
  try {
    const { data } = await api.get("/api/v1/admin/logs", {
      params: {
        page: page.value,
        size,
        query: filters.value.query || undefined,
        level: filters.value.level || undefined,
        service: filters.value.service || undefined
      }
    });

    logs.value = data.content;
    totalPages.value = data.totalPages;

    if (page.value >= totalPages.value) {
      page.value = 0;
      const reload = await api.get("/api/v1/admin/logs", {
        params: {
          page: 0,
          size,
          query: filters.value.query || undefined,
          level: filters.value.level || undefined,
          service: filters.value.service || undefined
        }
      });
      logs.value = reload.data.content;
      totalPages.value = reload.data.totalPages;
    }

  } finally {
    loading.value = false;
  }
}

function clearFilters() {
  filters.value = { query: "", level: "", service: "" };
  page.value = 0;
  loadLogs();
}

function changePage(p: number) {
  page.value = p;
  loadLogs();
}

function applyFilters() {
  page.value = 0;
  loadLogs();
}

function openModal(log: any) {
  modalLog.value = log;
}

onMounted(loadLogs);
</script>

<style scoped>
.input {
  @apply w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm;
}
.label {
  @apply text-xs text-gray-300 mb-1 block;
}
.th {
  @apply text-left py-3 px-4;
}
.td {
  @apply py-3 px-4;
}
.tr {
  @apply border-t border-gray-700 hover:bg-gray-800 transition;
}
.btn-gray {
  @apply bg-gray-700 hover:bg-gray-600 rounded py-1 px-3;
}
</style>
