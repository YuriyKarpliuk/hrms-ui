<template>
  <div class="min-h-screen bg-gray-900 text-white p-8">
    <h1 class="text-4xl font-extrabold text-orange-500 mb-10 text-center">
      Admin Dashboard
    </h1>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
      <DashboardCard
        title="Employees"
        subtitle="All registered employees"
        :value="data.metrics.employees"
        icon="👥"
      />
      <DashboardCard
        title="Organizations"
        subtitle="Active organizations"
        :value="data.metrics.organizations"
        icon="🏢"
      />
      <DashboardCard
        title="Departments"
        subtitle="Departments across all organizations"
        :value="data.metrics.departments"
        icon="🗂️"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
      <div class="bg-gray-800 p-6 rounded-2xl shadow border border-gray-700">
        <h2 class="text-xl font-bold text-orange-500 mb-4">Users by Role</h2>
        <canvas id="roleChart" height="150"></canvas>
      </div>

      <div class="bg-gray-800 p-6 rounded-2xl shadow border border-gray-700">
        <h2 class="text-xl font-bold text-orange-500 mb-4">
          New Accounts (Last 30 days)
        </h2>
        <canvas id="accountsChart" height="150"></canvas>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
      <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow">
        <h2 class="text-xl font-bold text-orange-500 mb-4">
          New Employees This Month
        </h2>
        <p class="text-5xl font-bold">{{ data.newEmployeesThisMonth }}</p>
      </div>

      <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow">
        <h2 class="text-xl font-bold text-orange-500 mb-4">
          Gender Distribution
        </h2>
        <p>👨 Male: {{ data.gender.male }}</p>
        <p>👩 Female: {{ data.gender.female }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
      <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow">
        <h2 class="text-xl font-bold text-orange-500 mb-4">
          Largest Organizations
        </h2>
        <ul class="space-y-2 text-sm">
          <li
            v-for="o in data.topOrganizations"
            :key="o.name"
            class="flex justify-between border-b border-gray-700 pb-1"
          >
            <span>{{ o.name }}</span>
            <span class="text-gray-400">{{ o.count }} employees</span>
          </li>
        </ul>
      </div>

      <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow">
        <h2 class="text-xl font-bold text-orange-500 mb-4">
          Largest Departments
        </h2>
        <ul class="space-y-2 text-sm">
          <li
            v-for="d in data.topDepartments"
            :key="d.name"
            class="flex justify-between border-b border-gray-700 pb-1"
          >
            <span>{{ d.name }}</span>
            <span class="text-gray-400">{{ d.count }} employees</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import DashboardCard from "../components/DashboardCard.vue";
import api from "../lib/api";
import Chart from "chart.js/auto";

const data = ref({
  metrics: { employees: 0, organizations: 0, departments: 0 },
  topOrganizations: [],
  topDepartments: [],
  gender: { male: 0, female: 0 },
  newEmployeesThisMonth: 0,
  roleStats: [],
  newAccounts: { days: [], values: [] },
});

async function loadDashboard() {
  const res = await api.get("/api/v1/admin/dashboard");
  data.value = res.data;

  drawRoleChart(data.value.roleStats);
  drawAccountsChart(data.value.newAccounts);
}

function drawRoleChart(stats) {
  const canvas = document.getElementById("roleChart") as HTMLCanvasElement;
  if (!canvas) return;

  new Chart(canvas, {
    type: "pie",
    data: {
      labels: ["Admins", "HR", "Managers", "Users"],
      datasets: [
        {
          data: stats,
          backgroundColor: ["#fb923c", "#f87171", "#60a5fa", "#4ade80"],
        },
      ],
    },
  });
}

function drawAccountsChart(stats) {
  if (!stats || !stats.days || !stats.values) return;

  const canvas = document.getElementById("accountsChart") as HTMLCanvasElement;
  if (!canvas) return;

  new Chart(canvas, {
    type: "line",
    data: {
      labels: stats.days,
      datasets: [
        {
          label: "New Accounts",
          data: stats.values,
          borderColor: "#fb923c",
          fill: false,
        },
      ],
    },
  });
}

onMounted(loadDashboard);
</script>
