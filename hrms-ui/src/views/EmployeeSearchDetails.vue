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
          <h1 class="text-2xl font-bold text-orange-500">Employee Details</h1>
          <p class="text-sm text-gray-400">
            Profile overview and contact information
          </p>
        </div>
        <button
          @click="goBack"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition"
        >
          ← Back
        </button>
      </div>

      <div v-if="loading" class="text-center py-20 text-gray-400">
        Loading employee...
      </div>
      <div v-else-if="!employee" class="text-center py-20 text-gray-500">
        Employee not found.
      </div>

      <div v-else class="p-6 space-y-8">
        <div class="flex flex-col md:flex-row gap-8 items-center">
          <img
            :src="employee.avatarUrl || '/default-avatar.png'"
            alt="Avatar"
            class="w-40 h-40 rounded-full border-4 border-orange-500 object-cover shadow-lg"
          />
          <div class="flex-1 text-center md:text-left">
            <h2 class="text-3xl font-bold text-orange-400">
              {{ employee.firstName }} {{ employee.lastName }}
            </h2>
            <p class="text-gray-400 mt-1">{{ employee.position || "—" }}</p>

            <div
              class="mt-4 flex flex-wrap gap-3 justify-center md:justify-start"
            >
              <span
                class="px-3 py-1 text-sm font-semibold rounded-full"
                :class="statusColor(employee.status)"
              >
                {{ employee.status }}
              </span>

              <span
                v-if="employee.gender"
                class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
              >
                {{ employee.gender }}
              </span>

              <span
                v-if="employee.maritalStatus"
                class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
              >
                {{ employee.maritalStatus }}
              </span>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div class="info-card">
            <h3 class="card-title">Contact Information</h3>
            <p><strong>Email:</strong> {{ employee.email }}</p>
            <p><strong>Phone:</strong> {{ employee.phone || "—" }}</p>
            <p>
              <strong>Office Location:</strong>
              {{ employee.officeLocation || "—" }}
            </p>
          </div>

          <div class="info-card">
            <h3 class="card-title">Organization</h3>
            <p>
              <strong>Organization:</strong>
              {{ employee.organizationName || "—" }}
            </p>
            <p>
              <strong>Department:</strong> {{ employee.departmentName || "—" }}
            </p>
            <p>
              <strong>Manager:</strong> {{ employee.managerFullName || "—" }}
            </p>
            <p><strong>HR:</strong> {{ employee.hrFullName || "—" }}</p>
          </div>

          <div class="info-card">
            <h3 class="card-title">Employment</h3>
            <p><strong>Hired At:</strong> {{ formatDate(employee.hiredAt) }}</p>
            <p>
              <strong>Terminated At:</strong>
              {{ formatDate(employee.terminatedAt) || "—" }}
            </p>
            <p><strong>Tax Number:</strong> {{ employee.taxNumber || "—" }}</p>
            <p><strong>Age:</strong> {{ employee.age || "—" }}</p>
          </div>

          <div class="info-card">
            <h3 class="card-title">About</h3>
            <p class="whitespace-pre-wrap">
              {{ employee.about || "No description provided." }}
            </p>
          </div>
        </div>

        <div v-if="employee.cvKey" class="text-center mt-8">
          <a
            :href="employee.cvKey"
            target="_blank"
            class="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg transition inline-flex items-center gap-2"
          >
            <i class="fa-solid fa-file-pdf"></i> View CV
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../lib/api";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  organizationName?: string;
  departmentName?: string;
  managerFullName?: string;
  hrFullName?: string;
  officeLocation?: string;
  status: string;
  gender?: string;
  maritalStatus?: string;
  hiredAt?: string;
  terminatedAt?: string;
  birthDate?: string;
  taxNumber?: string;
  about?: string;
  avatarUrl?: string;
  cvKey?: string;
  age?: number;
}

const route = useRoute();
const router = useRouter();
const employee = ref<Employee | null>(null);
const loading = ref(true);

async function fetchEmployee() {
  try {
    const { data } = await api.get(`/api/v1/employees/${route.params.id}`);
    employee.value = data;
  } catch (err) {
    console.error("Error loading employee:", err);
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.go(-1);
}

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function statusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200";
    case "ON_LEAVE":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200";
    case "TERMINATED":
      return "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  }
}

onMounted(fetchEmployee);
</script>

<style scoped>
.info-card {
  @apply bg-gray-100 dark:bg-gray-700/60 rounded-xl p-5 border border-gray-600;
}
.card-title {
  @apply text-lg font-semibold mb-3 text-orange-400;
}
</style>
