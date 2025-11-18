<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 p-8">
    <div class="mb-10 text-center animate-fade-in">
      <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500">
        Manager Dashboard
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2 text-lg">
        Lead your team efficiently 
      </p>
    </div>



    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-slide-up">
      <DashboardCard title="Total Employees" :value="metrics.totalEmployees" subtitle="Team members" />
      <DashboardCard title="On Leave" :value="metrics.onLeave" subtitle="Currently out" />
      <DashboardCard title="Pending Timesheets" :value="metrics.pendingTimesheets" subtitle="Awaiting review" />
      <DashboardCard title="Approved Payrolls" :value="metrics.approvedPayrolls" subtitle="Processed this month" />
    </div>

    <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border dark:border-gray-700 mb-10 animate-slide-up">
      <h2 class="text-xl font-bold text-orange-500 mb-6">Team Activity Overview</h2>
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex-1">
          <p class="text-sm text-gray-500 mb-2">Overall engagement this week</p>
          <div class="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-700"
              :style="{ width: engagement + '%' }"
            ></div>
          </div>
          <p class="mt-2 text-sm text-gray-400">Average hours logged: {{ avgHours }}h</p>
        </div>
        <div class="flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-tr from-yellow-100 to-orange-200 dark:from-gray-700 dark:to-gray-800 text-3xl font-bold text-orange-500">
          {{ Math.round(engagement) }}%
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border dark:border-gray-700">
        <h2 class="text-xl font-bold text-orange-500 mb-4">Timesheet Status Breakdown</h2>
        <canvas id="timesheetChart" height="150"></canvas>
      </div>
      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border dark:border-gray-700">
        <h2 class="text-xl font-bold text-orange-500 mb-4">Team Payroll Trend</h2>
        <canvas id="payrollChart" height="150"></canvas>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border dark:border-gray-700 mb-10 animate-slide-up">
      <h2 class="text-xl font-bold text-orange-500 mb-4">Top Performers</h2>
      <table class="min-w-full text-sm">
        <thead>
          <tr class="text-left border-b dark:border-gray-700">
            <th class="py-2 px-3">Employee</th>
            <th class="py-2 px-3">Hours</th>
            <th class="py-2 px-3">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in topPerformers" :key="emp.employeeId" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <td class="py-2 px-3 font-medium">{{ emp.employeeName }}</td>
            <td class="py-2 px-3">{{ emp.hours }}</td>
            <td class="py-2 px-3">
              <span
                class="px-3 py-1 text-xs font-semibold rounded-full"
                :class="emp.onLeave ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'"
              >
                {{ emp.onLeave ? 'On Leave' : 'Active' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border dark:border-gray-700 mb-10 animate-fade-in">
      <h2 class="text-xl font-bold text-orange-500 mb-4">Recent Activity</h2>
      <ul>
        <li
          v-for="(item, index) in recentActivity"
          :key="index"
          class="flex items-center justify-between py-2 border-b last:border-none dark:border-gray-700"
        >
          <span class="text-sm">{{ item.description }}</span>
          <span class="text-xs text-gray-500">{{ formatTime(item.timestamp) }}</span>
        </li>
      </ul>
    </div>

    <div class="flex flex-wrap justify-center gap-6">
      <RouterLink to="/manager/timesheets" class="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition">
        Review Timesheets
      </RouterLink>
      <RouterLink to="/manager/leaves" class="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition">
        Approve Leaves
      </RouterLink>
      <RouterLink to="/manager/payrolls" class="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
        Manage Payrolls
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import Chart from "chart.js/auto"
import axios from "axios"
import api from "../lib/api"
import DashboardCard from "../components/DashboardCard.vue"

const metrics = ref({
  totalEmployees: 0,
  onLeave: 0,
  pendingTimesheets: 0,
  approvedPayrolls: 0,
})

const topPerformers = ref<{ employeeId: number; employeeName: string; hours: number; onLeave: boolean }[]>([])
const recentActivity = ref<{ description: string; timestamp: string }[]>([])
const quote = ref("Success is not built in a day — it's built daily.")
const engagement = ref(0)
const avgHours = ref(0)

async function fetchManagerDashboard() {
  const managerId = localStorage.getItem("currentUserId")
  if (!managerId) return
8
  try {
    const { data } = await api.get(`/api/v1/employees/manager/dashboard/${managerId}`)
    metrics.value = {
      totalEmployees: data.totalEmployees,
      onLeave: data.onLeave,
      pendingTimesheets: data.pendingTimesheets,
      approvedPayrolls: data.approvedPayrolls,
    }
    topPerformers.value = data.topPerformers || []
    recentActivity.value = data.recentActivity || []

    avgHours.value = Math.round(topPerformers.value.reduce((s, e) => s + e.hours, 0) / (topPerformers.value.length || 1))
    engagement.value = Math.min(100, (avgHours.value / 40) * 100)

    drawTimesheetChart(data.pendingTimesheets, data.onLeave)
    drawPayrollChart(data.approvedPayrolls)
  } catch (err) {
    console.error("Error loading manager dashboard:", err)
  }
}

function drawTimesheetChart(pending: number, onLeave: number) {
  const ctx = document.getElementById("timesheetChart") as HTMLCanvasElement
  if (!ctx) return
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Pending Timesheets", "On Leave"],
      datasets: [{ data: [pending, onLeave], backgroundColor: ["#f59e0b", "#22c55e"] }],
    },
    options: { plugins: { legend: { position: "bottom" } } },
  })
}

function drawPayrollChart(approved: number) {
  const ctx = document.getElementById("payrollChart") as HTMLCanvasElement
  if (!ctx) return
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Approved Payrolls"],
      datasets: [{ label: "Count", data: [approved], backgroundColor: ["#f97316"] }],
    },
    options: { plugins: { legend: { display: false } } },
  })
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })
}

async function fetchQuote() {
  try {
    const { data } = await axios.get("https://api.allorigins.win/raw?url=https://zenquotes.io/api/random")
    if (data && data.length) quote.value = `${data[0].q} — ${data[0].a}`
  } catch {
    quote.value = "Good leaders inspire others to act, not to follow."
  }
}

onMounted(async () => {
  await fetchQuote()
  await fetchManagerDashboard()
})
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.7s ease-in-out; }
.animate-slide-up { animation: slide-up 0.7s ease-in-out; }
</style>
