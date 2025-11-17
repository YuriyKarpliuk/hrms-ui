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
          <h1 class="text-2xl font-bold text-orange-500">My Organization</h1>
          <p class="text-sm text-gray-400">
            Organization details and structure
          </p>
        </div>
      </div>

      <div v-if="loading" class="text-center py-20 text-gray-400">
        Loading organization...
      </div>
      <div v-else-if="!organization" class="text-center py-20 text-gray-500">
        Organization not found.
      </div>

      <div v-else class="p-6 space-y-8">
        <div class="flex flex-col md:flex-row gap-8 items-center">
          <div class="flex-1 text-center md:text-left">
            <h2 class="text-3xl font-bold text-orange-400">
              {{ organization.name }}
            </h2>
            <p class="text-gray-400 mt-2">
              Tax Number: {{ organization.taxNumber || "—" }}
            </p>
            <p v-if="organization.website" class="mt-3">
              🌐
              <a
                :href="organization.website"
                target="_blank"
                class="text-orange-400 hover:underline"
              >
                {{ organization.website }}
              </a>
            </p>
            <p v-if="organization.currency" class="mt-1">
              💱 Currency: <strong>{{ organization.currency }}</strong>
            </p>
          </div>
        </div>

        <div class="flex border-b border-gray-700">
          <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'px-4 py-2 text-sm font-medium',
              activeTab === tab
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-gray-400 hover:text-gray-200',
            ]"
          >
            {{ tab }}
          </button>
        </div>

        <div v-if="activeTab === 'Addresses'">
          <h3 class="text-xl font-semibold text-orange-400 mb-4">Addresses</h3>
          <table
            class="w-full border-collapse border border-gray-600 rounded-xl overflow-hidden"
          >
            <thead class="bg-gray-700 text-gray-100">
              <tr>
                <th class="p-3 text-left">Street</th>
                <th class="p-3 text-left">City</th>
                <th class="p-3 text-left">Postal Code</th>
                <th class="p-3 text-left">Country</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="addr in organization.addresses"
                :key="addr.id"
                class="border-t border-gray-700 hover:bg-gray-700/40"
              >
                <td class="p-3">{{ addr.houseNumber }} {{ addr.street }}</td>
                <td class="p-3">{{ addr.city }}</td>
                <td class="p-3">{{ addr.zipCode }}</td>
                <td class="p-3">{{ addr.country }}</td>
              </tr>
              <tr v-if="!organization.addresses?.length">
                <td colspan="5" class="text-center py-6 text-gray-400">
                  No addresses available
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="activeTab === 'Departments'">
          <h3 class="text-xl font-semibold text-orange-400 mb-4">
            Departments
          </h3>
          <div v-if="loadingDepts" class="text-gray-400 py-10 text-center">
            Loading departments...
          </div>
          <div v-else>
            <DepartmentTree :departments="departmentTree" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import api from "../lib/api";
import DepartmentTree from "../views/DepartmentTree.vue";

interface Department {
  id: number;
  name: string;
  orgId: number;
  managerId?: number;
  parentId?: number | null;
}

interface Organization {
  id: number;
  name: string;
  website?: string;
  currency?: string;
  taxNumber?: string;
  addresses: any[];
}

const loading = ref(true);
const organization = ref<Organization | null>(null);
const departments = ref<Department[]>([]);
const loadingDepts = ref(false);
const activeTab = ref("Addresses");
const tabs = ["Addresses", "Departments"];

async function fetchMyOrganization() {
  try {
    const empId = localStorage.getItem("currentUserId");
    const { data: employee } = await api.get(`/api/v1/employees/${empId}`);

    if (!employee.orgId) {
      loading.value = false;
      return;
    }

    const { data } = await api.get(`/api/v1/organizations/${employee.orgId}`);
    organization.value = data;
    await fetchDepartments(employee.orgId);
  } catch (err) {
    console.error("Error loading organization:", err);
  } finally {
    loading.value = false;
  }
}

const departmentTree = computed(() => {
  const map = new Map<number, any>();
  const roots: any[] = [];

  departments.value.forEach((d) => map.set(d.id, { ...d, children: [] }));
  departments.value.forEach((d) => {
    if (d.parentId && map.has(d.parentId)) {
      map.get(d.parentId).children.push(map.get(d.id));
    } else {
      roots.push(map.get(d.id));
    }
  });
  return roots;
});
async function fetchDepartments(orgId: number) {
  loadingDepts.value = true;
  try {
    const { data } = await api.get(`/api/v1/departments/organization/${orgId}`);
    const depts = data;

    const { data: employees } = await api.get(
      `/api/v1/employees/organization/${orgId}`
    );

    depts.forEach((d: any) => {
      d.employees = employees.filter((e: any) => e.deptId === d.id);
      d.managerName = employees.find(
        (e: any) => e.id === d.managerId
      )?.fullName;
    });

    departments.value = depts;
  } catch (err) {
    console.error("Error fetching departments:", err);
  } finally {
    loadingDepts.value = false;
  }
}

onMounted(fetchMyOrganization);
</script>
