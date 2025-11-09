<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 p-8">
     
    <div class="mb-10 text-center">
      <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 drop-shadow-md">
        My Dashboard
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2 text-lg">
        Welcome back, <span class="font-semibold text-orange-400">{{ dashboard.employeeName }} 👋</span>
      </p>
    </div>
    <div
      class="mb-10 relative mx-auto max-w-3xl text-center p-6 rounded-2xl border border-orange-300/30 bg-gradient-to-r from-orange-50/60 via-yellow-50/50 to-orange-100/60 dark:from-gray-800/60 dark:via-gray-900/50 dark:to-gray-800/70 shadow-lg shadow-orange-500/10 hover:shadow-orange-500/30 transition-all duration-700 backdrop-blur-sm animate-fade-in"
    >
      <div
        class="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md"
      >
        Motivation of the Day
      </div>
      <p
        class="mt-2 text-lg md:text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-yellow-600 to-orange-400 italic leading-relaxed"
      >
        “{{ quote }}”
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <DashboardCard
        title="Department"
        :value="dashboard.departmentName || '—'"
        icon="🏢"
        subtitle="Your current department"
      />
      <DashboardCard
        title="Work Hours"
        :value="`${dashboard.hoursThisWeek}/${dashboard.hoursTarget}`"
        icon="⏱️"
        subtitle="This week's hours"
      />
      <DashboardCard
        title="Vacation Days Left"
        :value="dashboard.vacationDaysLeft"
        icon="🌴"
        subtitle="Paid annual leave remaining"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <DashboardCard
        title="Sick Leave Left"
        :value="dashboard.sickLeaveLeft ?? 0"
        icon="🤒"
        subtitle="Remaining sick days"
      />
      <DashboardCard
        title="Unpaid Leave Left"
        :value="dashboard.unpaidLeaveLeft ?? 0"
        icon="💸"
        subtitle="Available unpaid leave"
      />
      <DashboardCard
        title="Vacation Days Used"
        :value="dashboard.vacationDaysUsed ?? 0"
        icon="📅"
        subtitle="Days already taken this year"
      />
    </div>

    <div class="relative bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-lg shadow-orange-500/10 border border-gray-200 dark:border-gray-700 mb-12 p-8 transition hover:shadow-orange-500/30">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-orange-500 flex items-center gap-2">
          <i class="fa-solid fa-chart-pie"></i> Work Progress
        </h2>
        <span class="text-sm text-gray-400">This week</span>
      </div>

      <div class="flex flex-col items-center">
        <div class="relative w-44 h-44">
          <svg class="w-full h-full" viewBox="0 0 36 36">
            <defs>
              <linearGradient id="grad" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#f97316" />
                <stop offset="100%" stop-color="#facc15" />
              </linearGradient>
            </defs>
            <path
              class="text-gray-300 dark:text-gray-700"
              stroke-width="3.8"
              fill="none"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              stroke="url(#grad)"
              :stroke-dasharray="progress + ', 100'"
              stroke-width="3.8"
              stroke-linecap="round"
              fill="none"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center text-3xl font-extrabold text-orange-500">
            {{ Math.round(progress) }}%
          </div>
        </div>
        <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {{ dashboard.hoursThisWeek }} / {{ dashboard.hoursTarget }} hours worked
        </p>
      </div>
    </div>

    <div class="bg-gradient-to-tr from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-lg shadow-orange-500/10 border border-gray-200 dark:border-gray-700 mb-12 p-8 hover:shadow-orange-500/30 transition">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-orange-500 flex items-center gap-2">
          <i class="fa-solid fa-chart-line"></i> Salary Trend
        </h2>
        <RouterLink to="/payrolls" class="text-sm text-orange-400 hover:text-orange-500 transition">
          View all →
        </RouterLink>
      </div>

      <canvas id="salaryChart" height="120"></canvas>
    </div>

    <div class="bg-gradient-to-tr from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-lg shadow-orange-500/10 border border-gray-200 dark:border-gray-700 p-8 transition hover:shadow-orange-500/30">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-orange-500 flex items-center gap-2">
          <i class="fa-solid fa-umbrella-beach"></i> Upcoming Leaves
        </h2>
        <RouterLink to="/leaves" class="text-sm text-orange-400 hover:text-orange-500 transition">
          View all →
        </RouterLink>
      </div>

      <div v-if="!dashboard.upcomingLeaves?.length" class="text-gray-400 text-center py-10">
        <i class="fa-solid fa-sun text-4xl mb-3"></i>
        <p>No upcoming leaves.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        <div
          v-for="(leave, index) in dashboard.upcomingLeaves"
          :key="index"
          class="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-100 to-yellow-50 dark:from-gray-700 dark:to-gray-800 hover:scale-[1.02] hover:shadow-md hover:shadow-orange-500/20 transition-transform duration-300"
        >
          <div class="flex items-center justify-between">
            <span class="font-semibold text-orange-600 dark:text-orange-400">
              {{ leave.type === 'VACATION' ? '🌴 Vacation' : leave.type }}
            </span>
            <span class="text-xs text-gray-500">{{ formatRange(leave.startDate, leave.endDate) }}</span>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import api from "../lib/api";
import DashboardCard from "../components/DashboardCard.vue";
import Chart from "chart.js/auto";
import axios from "axios"

const dashboard = ref<any>({});
const loading = ref(true);
const quote = ref("Loading inspiration…");

async function fetchQuote() {
  try {
const { data } = await axios.get("https://api.allorigins.win/raw?url=https://zenquotes.io/api/random");
    if (data && data.length) {
      quote.value = `${data[0].q} — ${data[0].a}`;
    } else {
      quote.value = "Keep going — progress is built one line at a time.";
    }
  } catch (err) {
    console.warn("Failed to fetch quote:", err);
    quote.value = "Discipline beats motivation — show up every day.";
  }
}

const progress = computed(() =>
  dashboard.value.hoursTarget
    ? (dashboard.value.hoursThisWeek / dashboard.value.hoursTarget) * 100
    : 0
);

async function fetchDashboard() {
  try {
    const employeeId = localStorage.getItem("currentUserId");
    if (!employeeId) {
      console.error("Employee ID not found");
      loading.value = false;
      return;
    }
    const { data } = await api.get(`/api/v1/employees/dashboard/${employeeId}`);
    dashboard.value = data;

    setTimeout(drawSalaryChart, 300);
  } catch (err) {
    console.error("Error fetching dashboard:", err);
  } finally {
    loading.value = false;
  }
}

function drawSalaryChart() {
  const ctx = document.getElementById("salaryChart") as HTMLCanvasElement;
  if (!ctx || !dashboard.value.recentPayrolls?.length) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: dashboard.value.recentPayrolls.map((p: any) =>
        new Date(p.periodEnd).toLocaleDateString(undefined, { month: "short" })
      ),
      datasets: [
        {
          label: "Net Salary (₴)",
          data: dashboard.value.recentPayrolls.map((p: any) => p.netSalary),
          borderColor: "#f97316",
          backgroundColor: "rgba(249, 115, 22, 0.1)",
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#aaa" }, grid: { display: false } },
        y: { ticks: { color: "#aaa" }, grid: { color: "rgba(255,255,255,0.1)" } },
      },
    },
  });
}

function formatRange(start: string, end: string) {
  const s = new Date(start).toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  const e = new Date(end).toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  return `${s} - ${e}`;
}

onMounted(async () => {
  await fetchQuote();
  fetchDashboard();
});</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.6s ease-in-out;
}
</style>
