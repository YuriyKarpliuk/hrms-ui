<template>
  <header
    class="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-50 transition-all duration-300 border-b border-gray-700"
    :class="[
      collapsed ? 'left-20' : 'left-64',
      scrolled
        ? 'bg-gray-800 shadow-lg shadow-black/40'
        : 'bg-gray-900 shadow-inner',
    ]"
  >
    <button
      class="flex items-center justify-center w-10 h-10 rounded-md bg-gray-800 hover:bg-orange-500/20 text-gray-300 hover:text-orange-400 transition"
      @click="$emit('toggleCollapse')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>

    <div ref="profileWrapper" class="relative flex items-center gap-4">
      <div class="relative">
        <button
          @click="toggleNotifications"
          class="relative w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-orange-500/20 text-gray-300 hover:text-orange-400 transition"
        >
          🔔
          <span
            v-if="unreadCount > 0"
            class="absolute -top-1 -right-1 bg-orange-500 text-xs text-white rounded-full px-1.5 py-0.5 animate-pulse"
          >
            {{ unreadCount }}
          </span>
        </button>

        <transition name="fade">
          <div
            v-if="notificationsOpen"
            class="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div
              v-if="notifications.length"
              class="max-h-80 overflow-y-auto divide-y divide-gray-700"
            >
              <div
                v-for="n in notifications"
                :key="n.id"
                @click="handleNotificationClick(n)"
                class="p-3 hover:bg-gray-700 cursor-pointer transition"
                :class="{ 'opacity-60': n.read }"
              >
                <p class="text-sm text-orange-400 font-semibold">
                  {{ n.title }}
                </p>
                <p class="text-gray-300 text-sm">{{ n.message }}</p>
                <p class="text-xs text-gray-500">
                  From:
                  <span class="text-orange-300 font-semibold">{{
                    n.senderName
                  }}</span>
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ new Date(n.createdAt).toLocaleString() }}
                </p>
              </div>
            </div>
            <p v-else class="text-gray-500 text-center py-3">
              No notifications yet
            </p>
          </div>
        </transition>
      </div>

      <div class="flex flex-col items-end mr-2">
        <p class="text-sm text-gray-200 font-semibold">
          {{ user?.firstName }} {{ user?.lastName }}
        </p>
      </div>

      <img
        :src="user?.avatarUrl || defaultAvatar"
        alt="User avatar"
        class="w-9 h-9 rounded-full border-2 border-orange-500 cursor-pointer object-cover hover:scale-105 transition"
        @click="toggleDropdown"
      />

      <transition name="fade">
        <div
          v-if="dropdownOpen"
          class="absolute top-12 right-0 w-44 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50"
        >
          <RouterLink
            to="/profile"
            class="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-orange-400 transition"
            @click="closeDropdown"
          >
            Profile
          </RouterLink>

          <button
            @click="handleLogout"
            class="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition"
          >
            Logout
          </button>
        </div>
      </transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import api from "../lib/api";
import { logout, getAccessToken } from "../services/authService";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const { collapsed } = defineProps<{ collapsed: boolean }>();
defineEmits(["toggleCollapse"]);

const router = useRouter();
const defaultAvatar = new URL(
  "../assets/images/default-avatar.png",
  import.meta.url
).href;

const user = ref<any>(null);
const dropdownOpen = ref(false);
const notificationsOpen = ref(false);
const notifications = ref<any[]>([]);
const unreadCount = ref(0);
const scrolled = ref(false);
const profileWrapper = ref<HTMLElement | null>(null);
let pollInterval: any = null;

function startPolling() {
  pollInterval = setInterval(() => {
    fetchNotifications();
  }, 30000);
}
onMounted(async () => {
  const token = getAccessToken();
  if (!token) return;
  try {
    const { data } = await api.get("/api/v1/employees/me");
    user.value = data;
    localStorage.setItem("currentUserId", data.id);
    await fetchNotifications();
    startPolling();
  } catch (err) {
    console.warn("Failed to load user info:", err);
  }
});
async function markAsRead(id: number) {
  try {
    await api.post(`/api/v1/user-notifications/${id}/read`);
    const notif = notifications.value.find((n) => n.id === id);
    if (notif) notif.read = true;
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
  }
}

function handleNotificationClick(n: any) {
  markAsRead(n.id);
}

async function fetchNotifications() {
  const employeeId = localStorage.getItem("currentUserId");
  if (!employeeId) return;
  try {
    const { data } = await api.get(`/api/v1/user-notifications/${employeeId}`);
    notifications.value = data;
    unreadCount.value = data.filter((n: any) => !n.read).length;
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
  }
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value;
  if (dropdownOpen.value) notificationsOpen.value = false;
}

function closeDropdown() {
  dropdownOpen.value = false;
}

async function handleLogout() {
  try {
    closeDropdown();
    logout();
    await router.push("/login");
  } catch (err) {
    console.error("Logout error:", err);
  }
}

function handleClickOutside(event: MouseEvent) {
  if (
    profileWrapper.value &&
    !profileWrapper.value.contains(event.target as Node)
  ) {
    dropdownOpen.value = false;
    notificationsOpen.value = false;
  }
}
async function markAllAsRead() {
  const employeeId = localStorage.getItem("currentUserId");
  if (!employeeId) return;
  try {
    await api.post(`/api/v1/user-notifications/read-all/${employeeId}`);
    notifications.value.forEach((n) => (n.read = true));
    unreadCount.value = 0;
  } catch (err) {
    console.error("Failed to mark all notifications as read:", err);
  }
}

function toggleNotifications() {
  notificationsOpen.value = !notificationsOpen.value;
  if (notificationsOpen.value) {
    dropdownOpen.value = false;
    markAllAsRead();
  }
}

onMounted(() => {
  window.addEventListener("click", handleClickOutside);
  window.addEventListener(
    "scroll",
    () => (scrolled.value = window.scrollY > 10)
  );
});
onUnmounted(() => {
  window.removeEventListener("click", handleClickOutside);
  if (pollInterval) clearInterval(pollInterval);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
