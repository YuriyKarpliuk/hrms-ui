<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import api from "../lib/api";
import { useRouter } from "vue-router";
import { getUserRoles } from "../services/authService";

const router = useRouter();

type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
type TaskType =
  | "ONBOARDING"
  | "OFFBOARDING"
  | "REVIEW"
  | "LEAVE_APPROVAL"
  | "CUSTOM";

interface HrTask {
  id: number;
  employeeId: number;
  createdBy: number;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  dueDate?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

interface EmployeeBasic {
  id: number;
  firstName: string;
  lastName: string;
}

const roles = getUserRoles();
const isHR = computed(() => roles.includes("HR") || roles.includes("ADMIN"));

const loading = ref(false);
const error = ref("");
const tasks = ref<HrTask[]>([]);

const filters = ref({
  status: "" as "" | TaskStatus,
  type: "" as "" | TaskType,
  onlyOverdue: false,
  title: "",
  dateFrom: "",
  dateTo: "",
});

const page = ref(1);
const pageSize = ref(10);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredTasks.value.length / pageSize.value))
);

const showCreateModal = ref(false);
const creating = ref(false);
const newTask = ref({
  employeeId: null as number | null,
  title: "",
  description: "",
  type: "CUSTOM" as TaskType,
  dueDate: "",
});

const employees = ref<EmployeeBasic[]>([]);
const employeeMap = computed(() => {
  const map = new Map<number, EmployeeBasic>();
  employees.value.forEach((e) => map.set(e.id, e));
  return map;
});

const showDetailsModal = ref(false);
const selectedTask = ref<HrTask | null>(null);

function openDetailsModal(task: HrTask) {
  selectedTask.value = task;
  showDetailsModal.value = true;
}

function closeDetailsModal() {
  selectedTask.value = null;
  showDetailsModal.value = false;
}

async function loadEmployeesForSelect() {
  try {
    const { data } = await api.get("/api/v1/employees");
    employees.value = data.map((e: any) => ({
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
    }));
  } catch (e) {
    console.error("Failed to load employees for select", e);
  }
}

async function loadTasks() {
  loading.value = true;
  error.value = "";

  try {
    const hrId = Number(localStorage.getItem("currentUserId"));

    if (!hrId) {
      throw new Error("HR ID not found");
    }

    const { data } = await api.get(`/api/v1/hr/tasks/mine/${hrId}`);
    tasks.value = data || [];
    page.value = 1;
  } catch (e) {
    console.error(e);
    error.value = "Failed to load tasks";
  } finally {
    loading.value = false;
  }
}

function isOverdue(task: HrTask): boolean {
  if (!task.dueDate || task.status === "COMPLETED") return false;

  const due = new Date(task.dueDate);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return due < today;
}

const filteredTasks = computed(() => {
  let result = tasks.value.slice();

  if (filters.value.status) {
    result = result.filter((t) => t.status === filters.value.status);
  }

  if (filters.value.type) {
    result = result.filter((t) => t.type === filters.value.type);
  }

  if (filters.value.onlyOverdue) {
    result = result.filter((t) => isOverdue(t));
  }

  if (filters.value.title.trim()) {
    const q = filters.value.title.trim().toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q)
    );
  }

  if (filters.value.dateFrom) {
    const from = new Date(filters.value.dateFrom);
    from.setHours(0, 0, 0, 0);
    result = result.filter((t) => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      return due >= from;
    });
  }

  if (filters.value.dateTo) {
    const to = new Date(filters.value.dateTo);
    to.setHours(0, 0, 0, 0);
    result = result.filter((t) => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      return due <= to;
    });
  }

  return result;
});

const pagedTasks = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTasks.value.slice(start, end);
});

function statusBadgeClass(status: TaskStatus) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/60 dark:text-yellow-100";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800 dark:bg-blue-800/60 dark:text-blue-100";
    case "COMPLETED":
      return "bg-green-100 text-green-800 dark:bg-green-800/60 dark:text-green-100";
    default:
      return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100";
  }
}

function typeBadge(type: TaskType) {
  switch (type) {
    case "ONBOARDING":
      return {
        text: "Onboarding",
        cls: "bg-indigo-100 text-indigo-800 dark:bg-indigo-800/60 dark:text-indigo-100",
      };
    case "OFFBOARDING":
      return {
        text: "Offboarding",
        cls: "bg-rose-100 text-rose-800 dark:bg-rose-800/60 dark:text-rose-100",
      };
    case "REVIEW":
      return {
        text: "Review",
        cls: "bg-purple-100 text-purple-800 dark:bg-purple-800/60 dark:text-purple-100",
      };
    case "LEAVE_APPROVAL":
      return {
        text: "Leave Approval",
        cls: "bg-teal-100 text-teal-800 dark:bg-teal-800/60 dark:text-teal-100",
      };
    default:
      return {
        text: "Custom",
        cls: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
      };
  }
}

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

async function changeStatus(task: HrTask, newStatus: TaskStatus) {
  if (task.status === newStatus) return;

  try {
    await api.patch(`/api/v1/hr/tasks/${task.id}/status`, {
      status: newStatus,
    });

    task.status = newStatus;
    if (newStatus === "COMPLETED") {
      task.completedAt = new Date().toISOString();
    }
  } catch (e) {
    console.error(e);
    alert("Failed to update status");
  }
}

async function markCompleted(task: HrTask) {
  await changeStatus(task, "COMPLETED");
}

function openEmployeeProfile(id: number) {
  router.push(`/search/employees/${id}`);
}

function getEmployeeName(id: number): string {
  const emp = employeeMap.value.get(id);
  if (!emp) return `Employee #${id}`;
  return `${emp.lastName} ${emp.firstName}`;
}

function openCreateModal() {
  showCreateModal.value = true;
}

function closeCreateModal() {
  showCreateModal.value = false;
  newTask.value = {
    employeeId: null,
    title: "",
    description: "",
    type: "CUSTOM",
    dueDate: "",
  };
}

async function createTask() {
  if (!newTask.value.employeeId || !newTask.value.title.trim()) {
    alert("Employee and title are required");
    return;
  }

  creating.value = true;

  try {
    const hrId = Number(localStorage.getItem("currentUserId"));

    if (!hrId) {
      throw new Error("HR ID not found");
    }

    const payload = {
      employeeId: newTask.value.employeeId,
      title: newTask.value.title,
      description: newTask.value.description || null,
      type: newTask.value.type,
      dueDate: newTask.value.dueDate || null,
    };

    await api.post(`/api/v1/hr/tasks/${hrId}`, payload);

    await loadTasks();
    closeCreateModal();
  } catch (e) {
    console.error(e);
    alert("Failed to create task");
  } finally {
    creating.value = false;
  }
}

function goToPrevPage() {
  if (page.value > 1) page.value--;
}

function goToNextPage() {
  if (page.value < totalPages.value) page.value++;
}
function clearFilters() {
  filters.value = {
    status: "",
    type: "",
    onlyOverdue: false,
    title: "",
    dateFrom: "",
    dateTo: "",
  };

  page.value = 1;
}
import { useRoute } from "vue-router";

const route = useRoute();
onMounted(async () => {
  const hrId = Number(localStorage.getItem("currentUserId"));
  if (!hrId) return router.push("/login");
  if (!isHR.value) return router.push("/user-dashboard");

  await Promise.all([loadTasks(), loadEmployeesForSelect()]);

  const openId = route.query.open;
  if (openId) {
    const t = tasks.value.find((x) => x.id === Number(openId));
    if (t) openDetailsModal(t);
  }
});

</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6"
  >
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-extrabold text-orange-500">HR Tasks</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Central place for all HR actions, onboarding, reviews and approvals
        </p>
      </div>

      <button
        v-if="isHR"
        @click="openCreateModal"
        class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
      >
        + New HR Task
      </button>
    </div>

    <div class="flex flex-wrap gap-4 mb-6 items-end">
      <div>
        <label class="text-xs text-gray-500 block mb-1">Status</label>
        <select
          v-model="filters.status"
          class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
        >
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div>
        <label class="text-xs text-gray-500 block mb-1">Type</label>
        <select
          v-model="filters.type"
          class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
        >
          <option value="">All</option>
          <option value="ONBOARDING">Onboarding</option>
          <option value="OFFBOARDING">Offboarding</option>
          <option value="REVIEW">Review</option>
          <option value="LEAVE_APPROVAL">Leave Approval</option>
          <option value="CUSTOM">Custom</option>
        </select>
      </div>

      <div>
        <label class="text-xs text-gray-500 block mb-1"
          >Title / Description</label
        >
        <input
          v-model="filters.title"
          type="text"
          placeholder="Search..."
          class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
        />
      </div>

      <div>
        <label class="text-xs text-gray-500 block mb-1">Due from</label>
        <input
          type="date"
          v-model="filters.dateFrom"
          class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
        />
      </div>

      <div>
        <label class="text-xs text-gray-500 block mb-1">Due to</label>
        <input
          type="date"
          v-model="filters.dateTo"
          class="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
        />
      </div>

      <label class="inline-flex items-center gap-2 text-sm mt-2">
        <input type="checkbox" v-model="filters.onlyOverdue" />
        <span>Only overdue</span>
      </label>

      <button
        @click="clearFilters"
        class="h-[38px] px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm text-white mt-6"
      >
        Clear Filters
      </button>
    </div>

    <div v-if="error" class="text-red-400 mb-4">{{ error }}</div>
    <div v-if="loading" class="text-center text-gray-400 py-10">
      Loading tasks...
    </div>

    <div
      v-else-if="pagedTasks.length"
      class="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <table class="min-w-full text-sm">
        <thead class="bg-gray-100 dark:bg-gray-700/80">
          <tr>
            <th class="py-3 px-5 text-left">Title</th>
            <th class="py-3 px-5 text-left">For</th>
            <th class="py-3 px-5 text-left">Type</th>
            <th class="py-3 px-5 text-left">Status</th>
            <th class="py-3 px-5 text-left">Due Date</th>
            <th class="py-3 px-5 text-left">Created</th>
            <th class="py-3 px-5 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="t in pagedTasks"
            :key="t.id"
            class="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition"
          >
            <td class="py-3 px-5 cursor-pointer" @click="openDetailsModal(t)">
              <div class="font-semibold text-gray-900 dark:text-gray-50">
                {{ t.title }}
              </div>
              <div
                class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1"
              >
                {{ t.description || "No description" }}
              </div>
            </td>

            <td class="py-3 px-5">
              <button
                class="text-xs text-blue-500 hover:underline"
                @click="openEmployeeProfile(t.employeeId)"
              >
                {{ getEmployeeName(t.employeeId) }}
              </button>
            </td>

            <td class="py-3 px-5">
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="typeBadge(t.type).cls"
              >
                {{ typeBadge(t.type).text }}
              </span>
            </td>

            <td class="py-3 px-5">
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="statusBadgeClass(t.status)"
              >
                {{ t.status }}
              </span>
            </td>

            <td class="py-3 px-5">
              {{ formatDate(t.dueDate) }}
              <span
                v-if="isOverdue(t)"
                class="ml-1 text-xs text-red-500 font-semibold"
              >
                • overdue
              </span>
            </td>

            <td class="py-3 px-5">
              {{ formatDate(t.createdAt) }}
            </td>

            <td class="py-3 px-5 text-right space-x-2">
              <select
                :value="t.status"
                @change="
                  changeStatus(t, ($event.target as HTMLSelectElement).value)
                "
                class="text-xs px-2 py-1 rounded-md bg-gray-800 text-gray-100 border border-gray-600"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        class="flex justify-between items-center px-5 py-3 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="text-xs text-gray-500">
          Page {{ page }} of {{ totalPages }} • {{ filteredTasks.length }} tasks
          found
        </div>
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1 text-xs rounded-lg border border-gray-400 dark:border-gray-600 disabled:opacity-40"
            :disabled="page === 1"
            @click="goToPrevPage"
          >
            Prev
          </button>
          <button
            class="px-3 py-1 text-xs rounded-lg border border-gray-400 dark:border-gray-600 disabled:opacity-40"
            :disabled="page === totalPages"
            @click="goToNextPage"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <p v-else class="text-gray-500 italic">No tasks found.</p>

    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div
        class="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-orange-400">New HR Task</h2>
          <button
            class="text-gray-400 hover:text-gray-200"
            @click="closeCreateModal"
          >
            ✖
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="label mb-1">For Employee</label>
            <select v-model="newTask.employeeId" class="input">
              <option :value="null" disabled>Select employee</option>
              <option v-for="e in employees" :key="e.id" :value="e.id">
                {{ e.firstName }} {{ e.lastName }}
              </option>
            </select>
          </div>

          <div>
            <label class="label mb-1">Title</label>
            <input
              v-model="newTask.title"
              placeholder="e.g. Send welcome email, Prepare contract..."
              class="input"
            />
          </div>

          <div>
            <label class="label mb-1">Type</label>
            <select v-model="newTask.type" class="input">
              <option value="ONBOARDING">Onboarding</option>
              <option value="OFFBOARDING">Offboarding</option>
              <option value="REVIEW">Review</option>
              <option value="LEAVE_APPROVAL">Leave Approval</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          <div>
            <label class="label mb-1">Due Date</label>
            <input type="date" v-model="newTask.dueDate" class="input" />
          </div>

          <div>
            <label class="label mb-1">Description</label>
            <textarea
              v-model="newTask.description"
              rows="3"
              class="input"
              placeholder="Optional details for this task..."
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
            @click="closeCreateModal"
          >
            Cancel
          </button>
          <button
            class="px-5 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
            :disabled="creating"
            @click="createTask"
          >
            {{ creating ? "Creating..." : "Create Task" }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showDetailsModal && selectedTask"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div
        class="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-xl"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-orange-400">
            Task #{{ selectedTask.id }} – {{ selectedTask.title }}
          </h2>
          <button
            class="text-gray-400 hover:text-gray-200"
            @click="closeDetailsModal"
          >
            ✖
          </button>
        </div>

        <div class="space-y-3 text-sm text-gray-200">
          <p>
            <b>For:</b>
            <button
              class="text-blue-400 hover:underline"
              @click="openEmployeeProfile(selectedTask.employeeId)"
            >
              {{ getEmployeeName(selectedTask.employeeId) }}
            </button>
          </p>
          <p>
            <b>Type:</b>
            {{ typeBadge(selectedTask.type).text }}
          </p>
          <p><b>Status:</b> {{ selectedTask.status }}</p>
          <p>
            <b>Due date:</b> {{ formatDate(selectedTask.dueDate) }}
            <span
              v-if="isOverdue(selectedTask)"
              class="ml-1 text-xs text-red-500 font-semibold"
            >
              overdue
            </span>
          </p>
          <p><b>Created at:</b> {{ formatDate(selectedTask.createdAt) }}</p>
          <p v-if="selectedTask.completedAt">
            <b>Completed at:</b> {{ formatDate(selectedTask.completedAt) }}
          </p>
          <p class="mt-3">
            <b>Description:</b>
          </p>
          <p class="text-gray-300 whitespace-pre-line">
            {{ selectedTask.description || "No description" }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input {
  @apply bg-gray-800 border border-gray-600 p-2 rounded text-sm w-full text-gray-100;
}
.label {
  @apply text-xs text-gray-400;
}
</style>
