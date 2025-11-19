<template>
  <div class="min-h-screen bg-gray-900 text-white p-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-extrabold text-orange-500">Departments</h1>
        <p class="text-sm text-gray-400">
          Manage departments across all organizations
        </p>
      </div>

      <button
        @click="openCreate"
        class="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-semibold shadow transition"
      >
        + Add Department
      </button>
    </div>

    <div class="grid md:grid-cols-3 gap-4 mb-6">
      <div>
        <label class="text-xs text-gray-400 block mb-1">Search</label>
        <input
          v-model="filters.query"
          class="w-full p-2 bg-gray-800 border border-gray-700 rounded"
          placeholder="Department name..."
          @keyup.enter="reloadFirstPage"
        />
      </div>

      <div>
        <label class="text-xs text-gray-400 block mb-1">Organization</label>
        <select
          v-model="filters.orgId"
          class="w-full p-2 bg-gray-800 border border-gray-700 rounded"
          @change="reloadFirstPage"
        >
          <option value="">All</option>
          <option v-for="o in organizations" :key="o.id" :value="o.id">
            {{ o.name }}
          </option>
        </select>
      </div>

      <div class="flex items-end gap-2">
        <button
          @click="reloadFirstPage"
          class="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded"
        >
          Apply
        </button>

        <button
          @click="clearFilters"
          class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
        >
          Clear
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center text-gray-400 py-8">
      Loading departments...
    </div>

    <div
      v-else-if="departments.length"
      class="bg-gray-800 border border-gray-700 rounded-xl shadow overflow-x-auto"
    >
      <table class="min-w-full text-sm">
        <thead class="bg-gray-700 text-gray-200">
          <tr>
            <th class="py-3 px-4 text-left">Name</th>
            <th class="py-3 px-4 text-left">Organization</th>
            <th class="py-3 px-4 text-left">Parent</th>
            <th class="py-3 px-4 text-left">Manager</th>
            <th class="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="d in departments"
            :key="d.id"
            class="border-t border-gray-700 hover:bg-gray-750 transition"
          >
            <td class="py-3 px-4 font-medium">{{ d.name }}</td>

            <td class="py-3 px-4 text-gray-300">
              {{ getOrgName(d.orgId) }}
            </td>

            <td class="py-3 px-4 text-gray-300">
              {{ getParentName(d.parentId) }}
            </td>

            <td class="td text-gray-300">
              {{ getManagerName(d.managerId) }}
            </td>

            <td class="py-3 px-4 text-right space-x-2">
              <button
                @click="openEdit(d)"
                class="text-blue-400 hover:text-blue-300"
              >
                ✏️
              </button>
              <button
                @click="removeDept(d.id)"
                class="text-red-400 hover:text-red-300"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex justify-end mt-4 p-3 items-center">
        <button
          class="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-sm mr-2 disabled:opacity-50"
          :disabled="page === 0"
          @click="prevPage"
        >
          Prev
        </button>

        <span class="px-4 py-2 text-sm">
          Page {{ page + 1 }} / {{ totalPages || 1 }}
        </span>

        <button
          class="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-sm ml-2 disabled:opacity-50"
          :disabled="page >= totalPages - 1"
          @click="nextPage"
        >
          Next
        </button>
      </div>
    </div>

    <p v-else class="text-gray-500 italic mt-8">No departments found.</p>

    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <div
        class="bg-gray-900 border border-gray-700 p-6 rounded-xl w-full max-w-lg shadow-xl"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-orange-400">
            {{ editingDept ? "Edit Department" : "Add Department" }}
          </h2>
          <button class="text-gray-400 hover:text-gray-200" @click="closeModal">
            ✖
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-gray-300 block mb-1">Name</label>
            <input v-model="form.name" class="input" />
          </div>

          <div>
            <label class="text-gray-300 block mb-1">Organization</label>
            <select v-model="form.orgId" class="input">
              <option v-for="o in organizations" :key="o.id" :value="o.id">
                {{ o.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="text-gray-300 block mb-1">Manager</label>
            <select v-model="form.managerId" class="input">
              <option :value="null">No manager</option>
              <option v-for="m in managers" :key="m.id" :value="m.id">
                {{ m.firstName }} {{ m.lastName }}
              </option>
            </select>
          </div>

          <div>
            <label class="text-gray-300 block mb-1">Parent Department</label>
            <select v-model="form.parentId" class="input">
              <option :value="null">No parent</option>
              <option v-for="d in departments" :key="d.id" :value="d.id">
                {{ d.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="closeModal" class="px-4 py-2 bg-gray-700 rounded-lg">
            Cancel
          </button>
          <button
            @click="saveDept"
            class="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="toast.visible"
        :class="[
          'fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium',
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600',
        ]"
      >
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../lib/api";

const departments = ref<any[]>([]);
const organizations = ref<any[]>([]);
const managers = ref<any[]>([]);
const loading = ref(false);

const filters = ref({
  query: "",
  orgId: "",
});

const page = ref(0);
const size = ref(10);
const totalPages = ref(1);

const showModal = ref(false);
const editingDept = ref<any | null>(null);

const form = ref<{
  name: string;
  orgId: number | string | null;
  parentId: number | null;
  managerId: number | null;
}>({
  name: "",
  orgId: "",
  parentId: null,
  managerId: null,
});

const toast = ref({ visible: false, message: "", type: "success" });

function showToast(msg: string, type: "success" | "error" = "success") {
  toast.value = { visible: true, message: msg, type };
  setTimeout(() => (toast.value.visible = false), 2500);
}

function getOrgName(orgId: number) {
  const o = organizations.value.find((o) => o.id === orgId);
  return o?.name || "—";
}

function getParentName(parentId) {
  if (!parentId) return "—";
  const p = allDepartments.value.find((d) => d.id === parentId);
  return p ? p.name : `#${parentId}`;
}


function getManagerName(managerId) {
  if (!managerId) return "—";
  const m = managers.value.find(x => x.id === managerId);
  return m ? `${m.firstName} ${m.lastName}` : `#${managerId}`;
}

async function loadOrganizations() {
  const { data } = await api.get("/api/v1/admin/organizations");
  organizations.value = data;
}

async function loadManagers() {
  const { data } = await api.get("/api/v1/employees/managers");
  managers.value = data;
}

async function loadDepartments() {
  loading.value = true;

  try {
    const request = {
      name: filters.value.query || null,
      orgId: filters.value.orgId || null,
    };

    const { data } = await api.post(
      `/api/v1/admin/departments/search?page=${page.value}&size=${size.value}`,
      request
    );

    departments.value = data.content || [];
    page.value = data.number ?? 0;
    totalPages.value = data.totalPages ?? 1;
  } catch (e) {
    console.error(e);
    showToast("Failed to load departments", "error");
  } finally {
    loading.value = false;
  }
}

function reloadFirstPage() {
  page.value = 0;
  loadDepartments();
}

function clearFilters() {
  filters.value = { query: "", orgId: "" };
  reloadFirstPage();
}

function openCreate() {
  editingDept.value = null;
  form.value = {
    name: "",
    orgId: organizations.value[0]?.id ?? null,
    parentId: null,
    managerId: null,
  };
  showModal.value = true;
}

function openEdit(dept: any) {
  editingDept.value = dept;
  form.value = {
    name: dept.name,
    orgId: dept.orgId,
    parentId: dept.parentId ?? null,
    managerId: dept.managerId ?? null,
  };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function saveDept() {
  if (!form.value.name.trim()) return showToast("Name required", "error");

  const payload = {
    name: form.value.name,
    orgId: form.value.orgId,
    parentId: form.value.parentId,
    managerId: form.value.managerId,
  };

  try {
    if (editingDept.value) {
      await api.patch(
        `/api/v1/admin/departments/${editingDept.value.id}`,
        payload
      );
      showToast("Department updated");
    } else {
      await api.post("/api/v1/admin/departments", payload);
      showToast("Department created");
    }

    showModal.value = false;
    loadDepartments();
  } catch (e) {
    console.error(e);
    showToast("Failed to save", "error");
  }
}

async function removeDept(id: number) {
  if (!confirm("Delete this department?")) return;

  try {
    await api.delete(`/api/v1/admin/departments/${id}`);
    showToast("Department deleted");
    loadDepartments();
  } catch (e) {
    console.error(e);
    showToast("Failed to delete", "error");
  }
}

function nextPage() {
  if (page.value < totalPages.value - 1) {
    page.value++;
    loadDepartments();
  }
}
const allDepartments = ref([]);

function prevPage() {
  if (page.value > 0) {
    page.value--;
    loadDepartments();
  }
}
async function loadAllDepartmentsForLookup() {
  const { data } = await api.get("/api/v1/admin/departments");
  allDepartments.value = data;
}


onMounted(async () => {
  await loadOrganizations();
  await loadAllDepartmentsForLookup();
  await loadManagers();
  await loadDepartments();
});
</script>

<style scoped>
.input {
  @apply w-full p-2 bg-gray-800 border border-gray-700 rounded;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
