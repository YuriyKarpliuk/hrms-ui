<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
    <div class="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
      <div class="flex justify-between items-center border-b border-gray-700 p-5">
        <div>
          <h1 class="text-2xl font-bold text-orange-500">My Payrolls</h1>
          <p class="text-sm text-gray-400">All your salary records in one place</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 p-5 border-b border-gray-700">
        <div>
          <label class="block text-sm font-medium text-gray-500 mb-1">Status</label>
          <select v-model="filters.status" class="input-filter w-full">
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-500 mb-1">From</label>
          <input type="date" v-model="filters.startDate" class="input-filter w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-500 mb-1">To</label>
          <input type="date" v-model="filters.endDate" class="input-filter w-full" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-500 mb-1">Min Salary</label>
          <input
            type="number"
            v-model.number="filters.minSalary"
            class="input-filter w-full"
            placeholder="₴"
            min="0"
            @input="validateSalaryRange"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-500 mb-1">Max Salary</label>
          <input
            type="number"
            v-model.number="filters.maxSalary"
            class="input-filter w-full"
            placeholder="₴"
            min="0"
            @input="validateSalaryRange"
          />
          <p v-if="salaryError" class="text-red-500 text-xs mt-1">{{ salaryError }}</p>
        </div>

        <div class="flex items-end justify-end md:col-span-5 gap-2">
          <button
            @click="searchPayrolls(0)"
            :disabled="salaryError || loading"
            class="btn-orange disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? "Searching..." : "Search" }}
          </button>
          <button @click="clearFilters" class="btn-gray">Clear Filters</button>
        </div>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-gray-500">
        <i class="fa-solid fa-spinner fa-spin text-3xl mb-3"></i>
        <p>Loading payroll data...</p>
      </div>

      <div v-else-if="payrolls.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500">
        <img src="https://cdn-icons-png.flaticon.com/512/7466/7466020.png" alt="Empty" class="w-32 mb-4 opacity-70" />
        <p>No payrolls found.</p>
      </div>
      <div v-else class="p-6 overflow-x-auto">
        <table class="min-w-full border-collapse text-sm">
          <thead class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase">
            <tr>
              <th class="py-3 px-4 text-left">Period</th>
              <th class="py-3 px-4 text-left">Base Salary</th>
              <th class="py-3 px-4 text-left">Bonus</th>
              <th class="py-3 px-4 text-left">Deductions</th>
              <th class="py-3 px-4 text-left">Net Amount</th>
              <th class="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in payrolls"
              :key="p.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-600 transition"
            >
              <td class="py-3 px-4 font-medium">{{ formatPeriod(p.periodStart, p.periodEnd) }}</td>
              <td class="py-3 px-4">{{ p.baseSalary?.toFixed(2) }} ₴</td>
              <td class="py-3 px-4 text-green-500">+{{ p.bonus?.toFixed(2) || 0 }} ₴</td>
              <td class="py-3 px-4 text-red-500">-{{ p.deductions?.toFixed(2) || 0 }} ₴</td>
              <td class="py-3 px-4 font-semibold">{{ p.netSalary?.toFixed(2) }} ₴</td>
              <td class="py-3 px-4 text-center">
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-yellow-500/20 text-yellow-500': p.status === 'PENDING',
                    'bg-green-500/20 text-green-500': p.status === 'PAID',
                    'bg-red-500/20 text-red-500': p.status === 'FAILED',
                  }"
                >
                  {{ p.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-if="totalPages > 1"
          class="flex justify-center items-center gap-4 py-6 text-sm text-gray-600 dark:text-gray-300"
        >
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 0"
            class="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </button>

          <span>Page {{ currentPage + 1 }} of {{ totalPages }}</span>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage >= totalPages - 1"
            class="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../lib/api";

const payrolls = ref<any[]>([]);
const loading = ref(true);
const filters = ref({
  status: "",
  startDate: "",
  endDate: "",
  minSalary: "",
  maxSalary: "",
});
const salaryError = ref<string | null>(null);

const totalPages = ref(0);
const currentPage = ref(0);
const pageSize = 10;

function validateSalaryRange() {
  const min = filters.value.minSalary;
  const max = filters.value.maxSalary;
  if (min && max && min > max) {
    salaryError.value = "Min salary cannot be greater than Max salary.";
  } else {
    salaryError.value = null;
  }
}

async function fetchPayrolls(page = 0) {
  loading.value = true;
  try {
    const employeeId = localStorage.getItem("currentUserId");
    if (!employeeId) {
      console.error("Employee ID not found");
      loading.value = false;
      return;
    }

    const { data } = await api.get(`/api/v1/payrolls/employee/${employeeId}?page=${page}&size=${pageSize}`);
    payrolls.value = data.content || data || [];
    totalPages.value = data.totalPages || 1;
    currentPage.value = data.number || 0;
  } catch (err) {
    console.error("Error fetching payrolls:", err);
  } finally {
    loading.value = false;
  }
}

async function searchPayrolls(page = 0) {
  if (salaryError.value) return;
  loading.value = true;
  try {
    const employeeId = localStorage.getItem("currentUserId");
    const params = {
      employeeId,
      status: filters.value.status || null,
      from: filters.value.startDate || null,
      to: filters.value.endDate || null,
      minNetSalary: filters.value.minSalary || null,
      maxNetSalary: filters.value.maxSalary || null,
    };
    const { data } = await api.post(`/api/v1/payrolls/search?page=${page}&size=${pageSize}`, params);
    payrolls.value = data.content || [];
    totalPages.value = data.totalPages || 1;
    currentPage.value = data.number || 0;
  } catch (err) {
    console.error("Error searching payrolls:", err);
  } finally {
    loading.value = false;
  }
}

function goToPage(page: number) {
  if (page >= 0 && page < totalPages.value) {
    searchPayrolls(page);
  }
}

function clearFilters() {
  filters.value = { status: "", startDate: "", endDate: "", minSalary: "", maxSalary: "" };
  salaryError.value = null;
  fetchPayrolls(0);
}

function formatPeriod(start: string, end: string) {
  const s = new Date(start).toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  const e = new Date(end).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
  return `${s} - ${e}`;
}

onMounted(fetchPayrolls);
</script>

<style scoped>
.input-filter {
  @apply border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700 text-sm;
}
.btn-orange {
  @apply bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg transition;
}
.btn-gray {
  @apply bg-gray-600 hover:bg-gray-500 text-white font-medium px-4 py-2 rounded-lg transition;
}
</style>
