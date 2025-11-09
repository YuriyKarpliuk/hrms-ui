<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-orange-500">Dashboard</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-1">
        Welcome back, <span class="font-semibold">Yuriy 👋</span>
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <DashboardCard title="Employees" :value="employees" icon="👥" subtitle="Total active employees" />
      <DashboardCard title="On Leave" :value="leaves" icon="🌴" subtitle="Currently on leave" />
      <DashboardCard title="Payrolls" :value="payrolls" icon="💰" subtitle="Processed this month" />
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow hover:shadow-lg transition">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-orange-500">Monthly Activity Overview</h2>
        <span class="text-gray-400 text-sm">Last updated: Nov 2025</span>
      </div>
      <canvas id="activityChart" height="120"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import DashboardCard from '../components/DashboardCard.vue'

const employees = ref(134)
const leaves = ref(12)
const payrolls = ref(128)

onMounted(() => {
  const ctx = document.getElementById('activityChart') as HTMLCanvasElement
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Employees',
          data: [120, 126, 130, 134, 138, 142],
          backgroundColor: 'rgba(255, 105, 0, 0.7)',
          borderRadius: 6,
        },
        {
          label: 'Leave Requests',
          data: [8, 10, 12, 11, 9, 12],
          backgroundColor: 'rgba(96, 165, 250, 0.6)',
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#bbb', font: { size: 12 } },
        },
      },
      scales: {
        x: {
          ticks: { color: '#999' },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          ticks: { color: '#999' },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    },
  })
})
</script>

<style scoped>
canvas {
  width: 100%;
  max-height: 400px;
}
</style>
