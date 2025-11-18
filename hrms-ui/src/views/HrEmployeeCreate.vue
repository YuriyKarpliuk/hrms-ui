<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../lib/api";

const router = useRouter();
const loading = ref(false);
const error = ref("");
const currentOrgId = ref<number | null>(null);
    const employeeId = localStorage.getItem("currentUserId");

const form = ref({
  deptId: null,
  orgId: null as number | null,
  managerId: null,
  hrId:employeeId,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  status: "ACTIVE",
  gender: "MALE",
  maritalStatus: "SINGLE",
  officeLocation: "",
  about: "",
  birthDate: "",
  hiredAt: "",
  roleNames: [] as string[],
});

const departments = ref<any[]>([]);
const managers = ref<any[]>([]);
const roles = ["USER", "MANAGER", "HR"];

async function loadDepsAndManagers() {
  const { data: deps } = await api.get("/api/v1/departments");
  const { data: mgrs } = await api.get("/api/v1/employees/managers");
  departments.value = deps;
  managers.value = mgrs;
}
async function loadCurrentUserOrg() {
  const { data } = await api.get("/api/v1/employees/me");
  currentOrgId.value = data.organization.id;
}

async function save() {
  loading.value = true;
  error.value = "";
  form.value.orgId = currentOrgId.value;

  try {
    const { data: created } = await api.post(
      "/api/v1/employees",
      form.value
    );

    router.push("/hr/employees");
  } catch (err) {
    console.error(err);
    error.value = "Failed to create employee";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadCurrentUserOrg();
  loadDepsAndManagers();
});
</script>

<template>
  <div class="p-6 text-white max-w-4xl mx-auto">
    <h1 class="text-3xl text-orange-400 font-bold mb-6">Create Employee</h1>

    <div v-if="error" class="text-red-400 mb-3">{{ error }}</div>

    <div class="bg-gray-800 p-6 rounded-xl space-y-4 border border-gray-700">
      <h2 class="text-lg text-gray-300 font-semibold">Personal Details</h2>
      <div class="grid md:grid-cols-2 gap-4">
        <input
          v-model="form.firstName"
          placeholder="First Name"
          class="input"
        />
        <input v-model="form.lastName" placeholder="Last Name" class="input" />
        <input v-model="form.email" placeholder="Email" class="input" />
        <input v-model="form.phone" placeholder="Phone" class="input" />
        <input v-model="form.position" placeholder="Position" class="input" />
        <input
          v-model="form.officeLocation"
          placeholder="Office Location"
          class="input"
        />
      </div>

      <textarea
        v-model="form.about"
        placeholder="About"
        class="input"
      ></textarea>

      <div class="grid md:grid-cols-3 gap-4">
        <div>
          <label class="label">Status</label>
          <select v-model="form.status" class="input">
            <option>ACTIVE</option>
            <option>ON_LEAVE</option>
            <option>INACTIVE</option>
            <option>TERMINATED</option>
          </select>
        </div>

        <div>
          <label class="label">Gender</label>
          <select v-model="form.gender" class="input">
            <option>MALE</option>
            <option>FEMALE</option>
          </select>
        </div>

        <div>
          <label class="label">Marital Status</label>
          <select v-model="form.maritalStatus" class="input">
            <option>SINGLE</option>
            <option>MARRIED</option>
          </select>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="label">Birth Date</label>
          <input type="date" v-model="form.birthDate" class="input" />
        </div>

        <div>
          <label class="label">Hired At</label>
          <input type="date" v-model="form.hiredAt" class="input" />
        </div>
      </div>

      <h2 class="text-lg text-gray-300 font-semibold">Work Assignment</h2>

      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="label">Department</label>
          <select v-model="form.departmentId" class="input">
            <option disabled value="">Select Department</option>
            <option v-for="d in departments" :key="d.id" :value="d.id">
              {{ d.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="label">Manager</label>
          <select v-model="form.managerId" class="input">
            <option value="">No manager</option>
            <option v-for="m in managers" :key="m.id" :value="m.id">
              {{ m.firstName }} {{ m.lastName }}
            </option>
          </select>
        </div>
      </div>

      <div>
        <p class="text-sm text-gray-400 mb-1">Roles</p>
        <div class="flex gap-4">
          <label v-for="r in roles" :key="r" class="flex items-center gap-2">
            <input type="checkbox" :value="r" v-model="form.roleNames" />
            {{ r }}
          </label>
        </div>
      </div>

      <button
        class="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg shadow-lg"
        @click="save"
        :disabled="loading"
      >
        {{ loading ? "Saving..." : "Save" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.input {
  @apply bg-gray-700 border border-gray-600 p-2 rounded text-sm w-full;
}
.label {
  @apply text-xs text-gray-400 mb-1 block;
}
</style>
