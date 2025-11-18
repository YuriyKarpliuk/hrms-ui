<template>
  <div
    class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 p-8"
  >
    <div class="mb-10 text-center animate-fade-in">
      <h1
        class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500"
      >
        HR Dashboard
      </h1>
    </div>

    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-slide-up"
    >
      <DashboardCard
        title="Total Employees"
        :value="metrics.totalEmployees"
        subtitle="All active employees"
        icon="👥"
      />

      <DashboardCard
        title="Open HR Tasks"
        :value="metrics.openTasks"
        subtitle="Need your attention"
        icon="📝"
      />

      <DashboardCard
        title="New Hires This Month"
        :value="metrics.newHires"
        subtitle="Recently onboarded"
        icon="🎉"
      />

      <DashboardCard
        title="Attrition (YTD)"
        :value="metrics.attrition + '%'"
        subtitle="Employees left company"
        icon="📉"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border dark:border-gray-700"
      >
        <h2 class="text-xl font-bold text-orange-500 mb-4">
          Recruitment Pipeline
        </h2>
        <canvas id="recruitChart" height="150"></canvas>
      </div>

      <div
        class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border dark:border-gray-700"
      >
        <h2 class="text-xl font-bold text-orange-500 mb-4">
          Onboarding Progress
        </h2>
        <canvas id="onboardChart" height="150"></canvas>
      </div>
    </div>

    <div
      class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow border dark:border-gray-700 mb-10"
    >
      <h2 class="text-xl font-bold text-orange-500 mb-4">Open HR Tasks</h2>

      <table class="min-w-full text-sm">
        <thead>
          <tr class="border-b dark:border-gray-700">
            <th class="py-2 px-3 text-left">Title</th>
            <th class="py-2 px-3 text-left">Employee</th>
            <th class="py-2 px-3 text-left">Type</th>
            <th class="py-2 px-3 text-left">Due Date</th>
            <th class="py-2 px-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="t in topTasks"
            :key="t.id"
            class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <td class="py-2 px-3 font-medium">{{ t.title }}</td>
            <td class="py-2 px-3">{{ t.employeeName }}</td>
            <td class="py-2 px-3">{{ t.type }}</td>
            <td class="py-2 px-3">{{ formatDate(t.dueDate) }}</td>
            <td class="py-2 px-3 text-right">
              <button
                @click="openTask(t.id)"
                class="text-xs px-3 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white"
              >
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow border dark:border-gray-700"
    >
      <h2 class="text-xl font-bold text-orange-500 mb-4">
        Upcoming Birthdays 🎂
      </h2>

      <div v-if="!birthdays.length" class="text-gray-500 text-center py-6">
        No upcoming birthdays.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="b in birthdays"
          :key="b.id"
          class="p-4 rounded-xl bg-gradient-to-r from-orange-100 to-yellow-50 dark:from-gray-700 dark:to-gray-800 shadow hover:scale-[1.02] transition"
        >
          <div class="font-semibold">{{ b.name }}</div>
          <div class="text-sm text-gray-500">{{ formatDate(b.date) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import DashboardCard from "../components/DashboardCard.vue";
import api from "../lib/api";
import Chart from "chart.js/auto";

const hrName = localStorage.getItem("currentUserName") || "HR User";

const metrics = ref({
  totalEmployees: 0,
  openTasks: 0,
  newHires: 0,
  attrition: 0,
});

const topTasks = ref([]);
const birthdays = ref([]);

function formatDate(d: string) {
  return new Date(d).toLocaleDateString();
}

async function fetchDashboard() {
  const hrId = localStorage.getItem("currentUserId");

  const { data } = await api.get(`/api/v1/hr/dashboard/${hrId}`);

  metrics.value = data.metrics;
  topTasks.value = data.topTasks;
  birthdays.value = data.birthdays;

  drawRecruitChart(data.recruitStats);
  drawOnboardChart(data.onboardStats);
}

function drawRecruitChart(stats) {
  const ctx = document.getElementById("recruitChart") as HTMLCanvasElement;
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Applied", "Interview", "Offer", "Hired"],
      datasets: [
        {
          label: "Candidates",
          data: stats,
          backgroundColor: ["#f97316", "#fb923c", "#fdba74", "#facc15"],
        },
      ],
    },
    options: { plugins: { legend: { display: false } } },
  });
}

function drawOnboardChart(stats) {
  const ctx = document.getElementById("onboardChart") as HTMLCanvasElement;
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Pending", "In Progress", "Completed"],
      datasets: [
        { data: stats, backgroundColor: ["#f97316", "#fb923c", "#4ade80"] },
      ],
    },
  });
}

function openTask(id: number) {
  location.href = `/hr/tasks?open=${id}`;
}

onMounted(fetchDashboard);
</script>
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
  animation: fade-in 0.7s ease-in-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-slide-up {
  animation: slide-up 0.7s ease-in-out;
}
</style>
