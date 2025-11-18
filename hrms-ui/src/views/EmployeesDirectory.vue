<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6"
  >
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-extrabold text-orange-500">Employees</h1>

      <button
        v-if="canEdit"
        @click="router.push('/hr/employees/create')"
        class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition"
      >
        + Add Employee
      </button>
    </div>

    <div class="flex flex-wrap gap-4 mb-6 items-end">
      <input
        v-model="filters.name"
        type="text"
        placeholder="Search by name or email..."
        class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border text-sm"
      />

      <select
        v-model="filters.status"
        class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border text-sm"
      >
        <option value="">All Statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="ON_LEAVE">On Leave</option>
        <option value="INACTIVE">Inactive</option>
        <option value="TERMINATED">Terminated</option>
      </select>

      <select
        v-model="filters.gender"
        class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border text-sm"
      >
        <option value="">All Genders</option>
        <option value="MALE">Male</option>
        <option value="FEMALE">Female</option>
      </select>

      <div class="flex items-center gap-2">
        <label class="text-sm">Hired From</label>
        <input
          type="date"
          v-model="filters.hiredFrom"
          class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border text-sm"
        />
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm">Hired To</label>
        <input
          type="date"
          v-model="filters.hiredTo"
          class="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border text-sm"
        />
      </div>

      <button
        @click="searchEmployees(0)"
        class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition"
      >
        Search
      </button>

      <button
        @click="clearFilters"
        class="bg-gray-600 hover:bg-gray-500 text-white px-5 py-2 rounded-lg"
      >
        Clear Filters
      </button>
    </div>

    <div v-if="loading" class="text-center text-gray-400 py-10">
      Loading employees...
    </div>

    <div
      v-else-if="employees.length"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-x-auto border"
    >
      <table class="min-w-full border-collapse text-sm">
        <thead class="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th class="py-3 px-5">#</th>
            <th class="py-3 px-5">Name</th>
            <th class="py-3 px-5">Email</th>
            <th class="py-3 px-5">Position</th>
            <th class="py-3 px-5">Department</th>
            <th class="py-3 px-5">Status</th>
            <th class="py-3 px-5" v-if="canEdit">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(emp, i) in employees"
            :key="emp.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <td class="py-3 px-5">{{ i + 1 + currentPage * size }}</td>

            <td
              class="py-3 px-5 font-medium flex items-center gap-2"
              @click="openDetails(emp.id)"
            >
              <img
                :src="emp.avatarUrl || '/default-avatar.png'"
                class="w-8 h-8 rounded-full object-cover"
              />
              {{ emp.firstName }} {{ emp.lastName }}
            </td>

            <td class="py-3 px-5">{{ emp.email }}</td>
            <td class="py-3 px-5">{{ emp.position || "—" }}</td>
            <td class="py-3 px-5">{{ emp.departmentName || "—" }}</td>

            <td class="py-3 px-5">
              <span
                class="px-3 py-1 text-xs font-semibold rounded-full"
                :class="statusColor(emp.status)"
              >
                {{ emp.status }}
              </span>
            </td>

            <td class="py-3 px-5" v-if="canEdit">
              <div class="flex gap-3 justify-end">
                <button
                  @click.stop="router.push(`/hr/employees/${emp.id}/edit`)"
                  class="text-blue-400 hover:text-blue-300"
                >
                  ✏️
                </button>

                <button
                  v-if="isAdmin"
                  @click.stop="openDeleteModal(emp)"
                  class="text-red-400 hover:text-red-300"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div
          class="bg-gray-900 border border-gray-700 rounded-xl p-6 w-[380px]"
        >
          <h2 class="text-xl font-bold text-red-400 mb-3">Delete Employee</h2>

          <p class="text-gray-300 mb-6">
            Are you sure you want to delete
            <span class="font-semibold text-white">
              {{ employeeToDelete.firstName }}
              {{ employeeToDelete.lastName }} </span
            >? This action cannot be undone.
          </p>

          <div class="flex justify-end gap-3">
            <button
              @click="closeDeleteModal"
              class="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </button>

            <button
              @click="confirmDelete"
              :disabled="deleting"
              class="px-5 py-2 rounded bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white"
            >
              {{ deleting ? "Deleting..." : "Delete" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-else class="text-gray-500 italic">No employees found.</p>

    <div v-if="totalPages > 1" class="flex justify-center mt-6 gap-3 text-sm">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 0"
        class="px-3 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>

      <span>Page {{ currentPage + 1 }} of {{ totalPages }}</span>

      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage >= totalPages - 1"
        class="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import api from "../lib/api";
import { getUserRoles } from "../services/authService";

const router = useRouter();

const roles = getUserRoles();
const isHR = computed(() => roles.includes("HR"));
const isAdmin = computed(() => roles.includes("ADMIN"));
const canEdit = computed(() => isHR.value || isAdmin.value);

const employees = ref([]);
const loading = ref(false);
const totalPages = ref(1);
const currentPage = ref(0);
const size = 8;

const filters = ref({
  name: "",
  status: "",
  gender: "",
  hiredFrom: "",
  hiredTo: "",
});

async function searchEmployees(page = 0) {
  loading.value = true;
  try {
    const payload = {
      firstName: filters.value.name || null,
      lastName: filters.value.name || null,
      email: filters.value.name || null,
      status: filters.value.status || null,
      gender: filters.value.gender || null,
      hiredFrom: filters.value.hiredFrom || null,
      hiredTo: filters.value.hiredTo || null,
    };

    const employeeId = localStorage.getItem("currentUserId");

    const { data } = await api.post(
      `/api/v1/employees/search/${employeeId}?page=${page}&size=${size}`,
      payload
    );

    employees.value = data.content || [];
    totalPages.value = data.totalPages || 1;
    currentPage.value = data.number || 0;
  } catch (err) {
    console.error("Error loading employees:", err);
  } finally {
    loading.value = false;
  }
}
const showDeleteModal = ref(false);
const deleting = ref(false);
const employeeToDelete = ref<any>(null);

function openDeleteModal(emp) {
  employeeToDelete.value = emp;
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  employeeToDelete.value = null;
  showDeleteModal.value = false;
  deleting.value = false;
}

async function confirmDelete() {
  if (!employeeToDelete.value) return;
  deleting.value = true;

  try {
    await api.delete(`/api/v1/employees/${employeeToDelete.value.id}`);
    closeDeleteModal();
    searchEmployees(currentPage.value);
  } catch (e) {
    console.error(e);
    alert("Failed to delete employee");
    deleting.value = false;
  }
}

function clearFilters() {
  filters.value = {
    name: "",
    status: "",
    gender: "",
    hiredFrom: "",
    hiredTo: "",
  };
  searchEmployees(0);
}

function changePage(p) {
  if (p >= 0 && p < totalPages.value) searchEmployees(p);
}

function openDetails(id) {
  if (isHR.value || isAdmin.value) router.push(`/employees/${id}`);
  else router.push(`/search/employees/${id}`);
}

function statusColor(status) {
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

async function deleteEmployee(id) {
  if (!confirm("Are you sure?")) return;
  await api.delete(`/api/v1/employees/${id}`);
  searchEmployees(currentPage.value);
}

onMounted(() => searchEmployees(0));
</script>
