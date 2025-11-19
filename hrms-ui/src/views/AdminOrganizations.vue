<template>
  <div class="min-h-screen bg-gray-900 text-white p-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-orange-500">Organizations</h1>
        <p class="text-sm text-gray-400">Manage companies inside the system</p>
      </div>

      <button
        @click="openCreate"
        class="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-semibold shadow transition"
      >
        + Add Organization
      </button>
    </div>

    <div class="grid md:grid-cols-4 gap-4 mb-6">
      <div>
        <label class="label">Name</label>
        <input v-model="filters.name" class="input" placeholder="Name..." />
      </div>

      <div>
        <label class="label">Tax Number</label>
        <input
          v-model="filters.taxNumber"
          class="input"
          placeholder="Tax number..."
        />
      </div>

      <div>
        <label class="label">City</label>
        <input v-model="filters.city" class="input" placeholder="City..." />
      </div>

      <div class="flex items-end gap-2">
        <button @click="loadOrganizations" class="btn-gray">Apply</button>
        <button @click="clearFilters" class="btn-gray">Clear</button>
      </div>
    </div>

    <div v-if="loading" class="text-gray-400 text-center py-10">Loading...</div>

    <div
      v-else-if="organizations.length"
      class="bg-gray-800 border border-gray-700 rounded-2xl shadow overflow-x-auto"
    >
      <table class="min-w-full text-sm">
        <thead class="bg-gray-700">
          <tr>
            <th class="th">Name</th>
            <th class="th">Website</th>
            <th class="th">Tax Number</th>
            <th class="th">Currency</th>
            <th class="th">Address</th>
            <th class="th text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="org in organizations" :key="org.id" class="tr">
            <td class="td font-medium">{{ org.name }}</td>

            <td class="td">
              <a
                v-if="org.website"
                :href="formatWebsite(org.website)"
                target="_blank"
                class="text-blue-400 hover:text-blue-300 underline"
              >
                {{ org.website }}
              </a>
              <span v-else>—</span>
            </td>

            <td class="td">{{ org.taxNumber || "—" }}</td>

            <td class="td">{{ org.currency || "—" }}</td>

            <td class="td">
              <template v-if="org.addresses?.length">
                {{ formatAddress(org.addresses[0]) }}
              </template>
              <template v-else> — </template>
            </td>

            <td class="td text-right space-x-3">
              <button
                @click="openEdit(org)"
                class="text-blue-400 hover:text-blue-300"
              >
                ✏️
              </button>
              <button
                @click="removeOrg(org.id)"
                class="text-red-400 hover:text-red-300"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex justify-end mt-4 p-3">
        <button
          class="btn-gray mr-2"
          :disabled="page === 0"
          @click="page--, loadOrganizations()"
        >
          Prev
        </button>

        <span class="px-4 py-2">Page {{ page + 1 }} / {{ totalPages }}</span>

        <button
          class="btn-gray ml-2"
          :disabled="page >= totalPages - 1"
          @click="page++, loadOrganizations()"
        >
          Next
        </button>
      </div>
    </div>

    <p v-else class="text-gray-500 italic">No organizations found.</p>

    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <div
        class="bg-gray-900 p-6 rounded-2xl border border-gray-700 w-[450px] shadow-xl"
      >
        <h2 class="text-xl font-bold text-orange-400 mb-4">
          {{ editingOrg ? "Edit Organization" : "Add Organization" }}
        </h2>

        <div class="space-y-4">
          <div>
            <label class="label">Name</label>
            <input v-model="form.name" class="input" />
          </div>

          <div>
            <label class="label">Website</label>
            <input v-model="form.website" class="input" />
          </div>

          <div>
            <label class="label">Currency</label>
            <input v-model="form.currency" class="input" />
          </div>

          <div>
            <label class="label">Tax Number</label>
            <input v-model="form.taxNumber" class="input" />
          </div>

          <div>
            <label class="label">Street</label>
            <input v-model="form.address.street" class="input" />
          </div>

          <div>
            <label class="label">City</label>
            <input v-model="form.address.city" class="input" />
          </div>

          <div>
            <label class="label">Country</label>
            <input v-model="form.address.country" class="input" />
          </div>
          <div>
            <label class="label">Zip Code</label>
            <input v-model="form.address.zipCode" class="input" />
          </div>
        </div>

        <div class="flex justify-end mt-6 gap-4">
          <button @click="close" class="btn-gray">Cancel</button>
          <button @click="saveOrg" class="btn-orange">Save</button>
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

const organizations = ref([]);
const loading = ref(false);

const page = ref(0);
const size = ref(10);
const totalPages = ref(1);

const filters = ref({
  name: "",
  taxNumber: "",
  city: "",
});

const form = ref({
  name: "",
  website: "",
  currency: "",
  taxNumber: "",
  address: {
    street: "",
    city: "",
    country: "",
    zipCode: "",
  },
});

const showModal = ref(false);
const editingOrg = ref(null);

const toast = ref({ visible: false, message: "", type: "success" });

function showToast(msg: string, type = "success") {
  toast.value = { visible: true, message: msg, type };
  setTimeout(() => (toast.value.visible = false), 3000);
}

function formatWebsite(url: string) {
  if (!url) return "";
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "https://" + url;
  }
  return url;
}

function formatAddress(a: any) {
  if (!a) return "—";
  return [a.street, a.city, a.country].filter(Boolean).join(", ");
}

async function loadOrganizations() {
  loading.value = true;

  try {
    const request = {
      name: filters.value.name || null,
      taxNumber: filters.value.taxNumber || null,
      city: filters.value.city || null,
    };

    const { data } = await api.post(
      `/api/v1/admin/organizations/search?page=${page.value}&size=${size.value}`,
      request
    );

    organizations.value = data.content;
    totalPages.value = data.totalPages ?? 1;
    page.value = data.number ?? 0;
  } catch (e) {
    showToast("Failed to load organizations", "error");
  } finally {
    loading.value = false;
  }
}

function clearFilters() {
  filters.value = {
    name: "",
    taxNumber: "",
    city: "",
  };
  page.value = 0;
  loadOrganizations();
}

function openCreate() {
  editingOrg.value = null;
  form.value = {
    name: "",
    website: "",
    currency: "",
    taxNumber: "",
    address: {
      street: "",
      city: "",
      country: "",
      zipCode: "",
    },
  };
  showModal.value = true;
}

function openEdit(org: any) {
  editingOrg.value = org;

  const addr = org.addresses?.[0] || {};

  form.value = {
    name: org.name || "",
    website: org.website || "",
    currency: org.currency || "",
    taxNumber: org.taxNumber || "",
    address: {
      street: addr.street || "",
      city: addr.city || "",
      country: addr.country || "",
      zipCode: a.zipCode || "",

    },
  };

  showModal.value = true;
}

function close() {
  showModal.value = false;
}

async function saveOrg() {
  try {
    const payload = {
      name: form.value.name,
      website: form.value.website,
      currency: form.value.currency,
      taxNumber: form.value.taxNumber,
      addresses: [form.value.address],
    };

    if (editingOrg.value) {
      await api.patch(
        `/api/v1/admin/organizations/${editingOrg.value.id}`,
        payload
      );
      showToast("Organization updated");
    } else {
      await api.post("/api/v1/admin/organizations", payload);
      showToast("Organization created");
    }

    showModal.value = false;
    loadOrganizations();
  } catch (e) {
    showToast("Failed to save", "error");
  }
}

async function removeOrg(id: number) {
  if (!confirm("Delete this organization?")) return;

  try {
    await api.delete(`/api/v1/admin/organizations/${id}`);
    showToast("Deleted");
    loadOrganizations();
  } catch {
    showToast("Failed to delete", "error");
  }
}

onMounted(loadOrganizations);
</script>

<style scoped>
.input {
  @apply w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm;
}
.label {
  @apply text-xs text-gray-300 mb-1 block;
}
.th {
  @apply py-3 px-4 text-left;
}
.td {
  @apply py-3 px-4;
}
.tr {
  @apply border-t border-gray-700 transition;
}
.btn-gray {
  @apply bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm;
}
.btn-orange {
  @apply bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-sm;
}
.badge {
  @apply px-3 py-1 rounded-full text-xs font-semibold;
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
