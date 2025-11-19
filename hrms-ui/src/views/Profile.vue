<template>
  <div
    class="min-h-screen flex flex-col items-center bg-gray-900 text-white py-12 px-4"
  >
    <div
      v-if="user"
      class="bg-gray-800/90 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-4xl"
    >
      <div class="flex flex-col items-center mb-8">
        <div class="relative group">
          <img
            :src="user.avatarUrl || defaultAvatar"
            alt="User avatar"
            class="w-32 h-32 rounded-full border-4 border-orange-500 object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
          />
          <label
            for="avatar-upload"
            class="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 p-2 rounded-full cursor-pointer transition-all shadow-md"
            title="Upload new avatar"
          >
            📷
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleAvatarUpload"
          />
        </div>
        <h1 class="text-3xl font-bold mt-4 text-orange-400">
          {{ user.firstName }} {{ user.lastName }}
        </h1>
        <p class="text-gray-400">{{ user.position || "Employee" }}</p>
      </div>

      <div class="bg-gray-800/60 border border-gray-700 rounded-xl p-5 mt-8">
        <h3
          class="text-xl font-semibold text-orange-400 mb-4 flex items-center gap-2"
        >
          <i
            class="mdi mdi-account-details-outline text-2xl text-orange-400"
          ></i>
          User Details
        </h3>

        <div class="grid md:grid-cols-2 gap-5 text-sm">
          <div>
            <label>Email</label>
            <input
              v-model="user.email"
              readonly
              class="input-base cursor-not-allowed"
            />
          </div>

          <div>
            <label>Phone</label>
            <input
              v-model="user.phone"
              :readonly="!editing"
              placeholder="Enter phone"
              class="input-base"
            />
          </div>

          <div>
            <label>Office Location</label>
            <input
              v-model="user.officeLocation"
              :readonly="!editing"
              placeholder="Enter office location"
              class="input-base"
            />
          </div>

          <div>
            <label>Gender</label>
            <select
              v-model="user.gender"
              :disabled="!editing"
              class="input-base"
            >
              <option value="">—</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div>
            <label>Marital Status</label>
            <select
              v-model="user.maritalStatus"
              :disabled="!editing"
              class="input-base"
            >
              <option value="">—</option>
              <option value="SINGLE">Single</option>
              <option value="MARRIED">Married</option>
            </select>
          </div>

          <div>
            <label>Birth Date</label>
            <input
              type="date"
              v-model="user.birthDate"
              :readonly="!editing"
              class="input-base"
            />
          </div>

          <div>
            <label>Tax Number</label>
            <input
              v-model="user.taxNumber"
              :readonly="!editing"
              placeholder="Enter tax number"
              class="input-base"
            />
          </div>

          <div>
            <label>Status</label>
            <input
              v-model="user.status"
              readonly
              class="input-base cursor-not-allowed"
            />
          </div>

          <div>
            <label>Hired At</label>
            <input
              :value="formatDate(user.hiredAt)"
              readonly
              class="input-base cursor-not-allowed"
            />
          </div>

          <div>
            <label>Terminated At</label>
            <input
              :value="formatDate(user.terminatedAt)"
              readonly
              class="input-base cursor-not-allowed"
            />
          </div>

          <div>
            <label>Age</label>
            <input
              :value="user.age"
              readonly
              class="input-base cursor-not-allowed"
            />
          </div>
        </div>
      </div>
      <div v-if="!isAdmin">
        <div class="mt-5">
          <label>About</label>
          <textarea
            v-model="user.about"
            :readonly="!editing"
            placeholder="Write something about yourself..."
            rows="3"
            class="input-base"
          ></textarea>
        </div>
        <div class="mt-8">
          <h3
            class="text-xl font-semibold text-orange-400 mb-3 flex items-center gap-2"
          >
            <i class="mdi mdi-file-account text-orange-400 text-2xl"></i> My CV
          </h3>
          <div class="flex items-center gap-3">
            <input
              type="file"
              id="cv-upload"
              accept="application/pdf"
              class="hidden"
              @change="handleCvUpload"
            />
            <label
              for="cv-upload"
              class="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg cursor-pointer text-white font-semibold shadow transition-all"
            >
              📄 Upload CV
            </label>
            <a
              v-if="user.cvKey"
              :href="user.cvKey"
              target="_blank"
              class="text-orange-400 underline hover:text-orange-300"
            >
              View My CV
            </a>
          </div>
        </div>

        <div class="bg-gray-800/60 border border-gray-700 rounded-xl p-5 mt-6">
          <h3
            class="text-xl font-semibold text-orange-400 mb-4 flex items-center gap-2"
          >
            <i
              class="mdi mdi-office-building-outline text-2xl text-orange-400"
            ></i>
            Organization Details
          </h3>
          <div class="divide-y divide-gray-700">
            <div class="flex justify-between py-2">
              <span class="text-gray-400">Organization</span>
              <span class="text-gray-200 font-medium">{{
                user.organization?.name || "—"
              }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-400">Department</span>
              <span class="text-gray-200 font-medium">{{
                user.department?.name || "—"
              }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-400">Manager</span>
              <span class="text-gray-200 font-medium"
                >{{ user.manager?.firstName }}
                {{ user.manager?.lastName || "—" }}</span
              >
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-400">HR</span>
              <span class="text-gray-200 font-medium"
                >{{ user.hr?.firstName }} {{ user.hr?.lastName || "—" }}</span
              >
            </div>
          </div>
        </div>

        <ProfileJsonSections
          class="mt-10"
          :employeeId="user.id"
          :languages="user.languages"
          :address="user.address"
          :education="user.education"
          :workExperience="user.workExperience"
          :profile="user.profile"
        />
      </div>
      <div class="flex justify-center mt-10">
        <button
          @click="handleLogout"
          class="bg-red-500 hover:bg-red-600 px-6 py-2.5 rounded-lg shadow-md text-white font-semibold transition-all"
        >
          Logout
        </button>
      </div>
    </div>

    <div v-else class="text-gray-400 py-20 text-center text-lg">
      Loading profile...
    </div>

    <transition name="fade">
      <div
        v-if="toast.visible"
        :class="[
          'fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300',
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
import { useRouter } from "vue-router";
import api from "../lib/api";
import { logout, getAccessToken } from "../services/authService";
import ProfileJsonSections from "../components/ProfileJsonSections.vue";

interface EmployeeResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  position?: string;
  avatarUrl?: string;
  phone?: string;
  officeLocation?: string;
  about?: string;
  gender?: string;
  maritalStatus?: string;
  birthDate?: string;
  organization?: { id: number; name: string };
  department?: { id: number; name: string };
  manager?: { id: number; firstName: string; lastName: string };
  hr?: { id: number; firstName: string; lastName: string };
  status?: string;
  taxNumber?: string;
  hiredAt?: string;
  terminatedAt?: string;
  age?: number;
  languages?: any;
  address?: any;
  education?: any;
  workExperience?: any;
  profile?: any;
  cvKey?: string;
  languagesJson?: any;
  addressJson?: any;
  educationJson?: any;
  workExperienceJson?: any;
  profileJson?: any;
}

const user = ref<EmployeeResponse | null>(null);
const router = useRouter();
const defaultAvatar = new URL(
  "../assets/images/default-avatar.png",
  import.meta.url
).href;
const editing = ref(false);
const toast = ref({ visible: false, message: "", type: "success" });
import { getUserRoles } from "../services/authService";
const roles = getUserRoles();
const isAdmin = roles.includes("ADMIN");

function formatDate(dateString?: string | null): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function showToast(message: string, type: "success" | "error" = "success") {
  toast.value = { visible: true, message, type };
  setTimeout(() => (toast.value.visible = false), 3000);
}

onMounted(async () => {
  const token = getAccessToken();
  if (!token) return;
  try {
    const { data } = await api.get<EmployeeResponse>("/api/v1/employees/me");
    user.value = {
      ...data,
      languages: data.languages || data.languagesJson || [],
      address: data.address || data.addressJson || {},
      education: data.education || data.educationJson || [],
      workExperience: data.workExperience || data.workExperience || [],
      profile: data.profile || data.profileJson || {},
    };
  } catch (err) {
    console.error("Failed to load user:", err);
  }
});

const handleLogout = async () => {
  logout();
  await router.push("/login");
};

async function handleAvatarUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file || !user.value) return;
  try {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(
      `/api/v1/employees/${user.value.id}/avatar`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    user.value.avatarUrl = data.avatarUrl;
    showToast("Avatar updated successfully!", "success");
  } catch (err) {
    console.error("Failed to upload avatar:", err);
    showToast("Failed to upload avatar.", "error");
  }
}

async function handleCvUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file || !user.value) return;
  if (file.type !== "application/pdf") {
    showToast("Only PDF files are allowed!", "error");
    return;
  }
  try {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(
      `/api/v1/employees/${user.value.id}/cv`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    user.value.cvKey = data.cvKey;
    showToast("CV uploaded successfully!", "success");
  } catch (err) {
    console.error("Failed to upload CV:", err);
    showToast("Failed to upload CV.", "error");
  }
}
</script>

<style scoped>
.input-base {
  @apply w-full p-2 bg-gray-700 border border-gray-600 rounded-lg mt-1 text-gray-200;
}
label {
  font-weight: 600;
  color: #ffb873;
}
</style>
