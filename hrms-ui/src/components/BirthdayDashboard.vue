<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 p-6">
    <div class="max-w-6xl mx-auto">
      <header
        class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6"
      >
        <div>
          <h1
            class="text-3xl font-extrabold text-orange-400 flex items-center gap-2"
          >
            🎂 Birthdays
          </h1>
          <p class="text-sm text-gray-400">
            See who has a birthday today and in the next 7 days in your
            organization.
          </p>
        </div>
        <div class="text-right text-sm text-gray-400">
          <div>
            Today:
            <span class="font-semibold text-gray-200">{{ todayLabel }}</span>
          </div>
          <div v-if="orgName">
            Organization:
            <span class="text-orange-300 font-semibold">{{ orgName }}</span>
          </div>
        </div>
      </header>

      <div v-if="loading" class="text-center py-20 text-gray-400">
        Loading birthdays...
      </div>

      <div v-else class="grid lg:grid-cols-2 gap-6">
        <section
          class="bg-gray-800/80 border border-gray-700 rounded-2xl p-5 shadow-lg"
        >
          <header class="flex items-center justify-between mb-4">
            <h2
              class="text-xl font-semibold text-pink-400 flex items-center gap-2"
            >
              Today’s birthdays
            </h2>
            <span
              class="px-3 py-1 rounded-full text-xs font-semibold"
              :class="
                todayBirthdays.length
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                  : 'bg-gray-700 text-gray-300 border border-gray-600'
              "
            >
              {{ todayBirthdays.length }} employee(s)
            </span>
          </header>

          <div v-if="todayBirthdays.length" class="space-y-3">
            <article
              v-for="emp in todayBirthdays"
              :key="emp.id"
              class="flex items-center gap-3 bg-gray-900/60 border border-pink-500/30 rounded-xl p-3 hover:border-pink-400/70 hover:-translate-y-0.5 transition"
            >
              <img
                :src="emp.avatarUrl || defaultAvatar"
                alt="avatar"
                class="w-12 h-12 rounded-full object-cover border-2 border-pink-400"
              />
              <div class="flex-1">
                <h3 class="font-semibold text-gray-100">
                  {{ emp.firstName }} {{ emp.lastName }}
                </h3>
                <p class="text-xs text-gray-400">
                  {{ emp.position || "Employee" }}
                  <span v-if="emp.departmentName">
                    • {{ emp.departmentName }}</span
                  >
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  Turns
                  <span class="font-semibold text-gray-200">{{
                    emp.turnsAge ?? "—"
                  }}</span>
                  today
                </p>
              </div>
              <div class="flex flex-col gap-2">
                <button
                  class="px-3 py-1 rounded-lg text-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                  @click="goToProfile(emp.id)"
                >
                  View profile
                </button>
                <button
                  class="px-3 py-1 rounded-lg text-xs bg-pink-500/20 hover:bg-pink-500/40 text-pink-200 border border-pink-400/50"
                  @click="openGreeting(emp)"
                >
                  Send greeting
                </button>
              </div>
            </article>
          </div>

          <p v-else class="text-gray-500 text-sm">No birthdays today.</p>
        </section>

        <section
          class="bg-gray-800/80 border border-gray-700 rounded-2xl p-5 shadow-lg"
        >
          <header class="flex items-center justify-between mb-4">
            <h2
              class="text-xl font-semibold text-orange-400 flex items-center gap-2"
            >
              Upcoming (next 7 days)
            </h2>
            <span
              class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-700 text-gray-200 border border-gray-600"
            >
              {{ upcomingBirthdays.length }} employee(s)
            </span>
          </header>

          <div v-if="upcomingBirthdays.length" class="space-y-3">
            <article
              v-for="emp in upcomingBirthdays"
              :key="emp.id"
              class="flex items-center gap-3 bg-gray-900/60 border border-gray-700 rounded-xl p-3 hover:border-orange-400/70 hover:-translate-y-0.5 transition"
            >
              <img
                :src="emp.avatarUrl || defaultAvatar"
                alt="avatar"
                class="w-10 h-10 rounded-full object-cover border border-orange-400/70"
              />
              <div class="flex-1">
                <h3 class="font-semibold text-gray-100 text-sm">
                  {{ emp.firstName }} {{ emp.lastName }}
                </h3>
                <p class="text-xs text-gray-400">
                  {{ emp.position || "Employee" }}
                  <span v-if="emp.departmentName">
                    • {{ emp.departmentName }}</span
                  >
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ formatUpcomingDate(emp.nextBirthdayDate) }}
                  <span v-if="emp.daysLeft !== undefined">
                    • in
                    <span class="font-semibold text-gray-200">{{
                      emp.daysLeft
                    }}</span>
                    day<span v-if="emp.daysLeft !== 1">s</span>
                  </span>
                </p>
              </div>
              <button
                class="px-3 py-1 rounded-lg text-xs bg-gray-700 hover:bg-gray-600 text-gray-100"
                @click="openGreeting(emp)"
              >
                Send greeting
              </button>
            </article>
          </div>

          <p v-else class="text-gray-500 text-sm">
            No upcoming birthdays in the next 7 days.
          </p>
        </section>
      </div>

      <transition name="fade">
        <div
          v-if="greetingModalOpen && selectedEmployee"
          class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        >
          <div
            class="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <header class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-orange-400">
                Send greeting to {{ selectedEmployee.firstName }}
                {{ selectedEmployee.lastName }}
              </h3>
              <button
                class="text-gray-400 hover:text-orange-400"
                @click="closeGreeting"
              >
                ✖
              </button>
            </header>

            <textarea
              v-model="greetingText"
              rows="4"
              class="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-100"
            ></textarea>

            <p class="text-xs text-gray-500 mt-2">
              This greeting will appear as an in-app notification for the
              employee.
            </p>

            <div class="flex justify-end gap-3 mt-4">
              <button
                class="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm"
                @click="closeGreeting"
              >
                Cancel
              </button>
              <button
                class="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-60"
                :disabled="sending || !greetingText.trim()"
                @click="sendGreeting"
              >
                <span v-if="sending">Sending...</span>
                <span v-else>Send greeting</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import api from "../lib/api";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  position?: string;
  departmentName?: string;
  birthDate?: string;
  avatarUrl?: string;
  orgId?: number;
}

interface TodayEmployee extends Employee {
  turnsAge?: number;
}

interface UpcomingEmployee extends Employee {
  nextBirthdayDate: string;
  daysLeft: number;
}

const router = useRouter();
const loading = ref(true);
const orgName = ref<string | null>(null);
const orgId = ref<number | null>(null);
const todayBirthdays = ref<TodayEmployee[]>([]);
const upcomingBirthdays = ref<UpcomingEmployee[]>([]);
const greetingModalOpen = ref(false);
const selectedEmployee = ref<Employee | null>(null);
const greetingText = ref("");
const sending = ref(false);

const defaultAvatar = new URL(
  "../assets/images/default-avatar.png",
  import.meta.url
).href;

const todayLabel = computed(() =>
  new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
);

onMounted(async () => {
  try {
    const { data: me } = await api.get("/api/v1/employees/me");
    orgId.value = me.organization.id;
    orgName.value = me.organization.name || null;

    if (!orgId.value) {
      loading.value = false;
      return;
    }

    const { data: today } = await api.get(
      `/api/v1/employees/org/${orgId.value}/birthdays/today`
    );
    todayBirthdays.value = (today || []).map((e: any) => ({
      ...e,
      turnsAge: calcAgeOnDate(e.birthDate, new Date()),
    }));

    const { data: allEmployees } = await api.get(
      `/api/v1/employees/organization/${orgId.value}`
    );
    upcomingBirthdays.value = computeUpcoming(allEmployees || [], 7);
  } catch (err) {
    console.error("Failed to load birthday data:", err);
  } finally {
    loading.value = false;
  }
});

function calcAgeOnDate(birthDate?: string, onDate?: Date): number | undefined {
  if (!birthDate) return undefined;
  const bd = new Date(birthDate);
  if (isNaN(bd.getTime())) return undefined;
  const ref = onDate ?? new Date();
  let age = ref.getFullYear() - bd.getFullYear();
  const mDiff = ref.getMonth() - bd.getMonth();
  if (mDiff < 0 || (mDiff === 0 && ref.getDate() < bd.getDate())) {
    age--;
  }
  return age;
}

function computeUpcoming(
  all: Employee[],
  daysRange: number
): UpcomingEmployee[] {
  const today = new Date();
  const todayMid = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const result: UpcomingEmployee[] = [];

  all.forEach((e) => {
    if (!e.birthDate) return;
    const bd = new Date(e.birthDate);
    if (isNaN(bd.getTime())) return;

    let next = new Date(todayMid.getFullYear(), bd.getMonth(), bd.getDate());
    if (next < todayMid) {
      next.setFullYear(next.getFullYear() + 1);
    }

    const diffMs = next.getTime() - todayMid.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0 && diffDays <= daysRange) {
      result.push({
        ...e,
        nextBirthdayDate: next.toISOString(),
        daysLeft: diffDays,
      });
    }
  });

  return result.sort(
    (a, b) =>
      new Date(a.nextBirthdayDate).getTime() -
      new Date(b.nextBirthdayDate).getTime()
  );
}

function formatUpcomingDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
  });
}

function goToProfile(id: number) {
  router.push(`/search/employees/${id}`);
}

function openGreeting(emp: Employee) {
  selectedEmployee.value = emp;
  greetingText.value = `Happy birthday, ${emp.firstName}! 🎂🎉 Wishing you lots of success and positive moments at work and beyond!`;
  greetingModalOpen.value = true;
}

function closeGreeting() {
  greetingModalOpen.value = false;
  selectedEmployee.value = null;
  greetingText.value = "";
}



async function sendGreeting() {
  if (!selectedEmployee.value || !greetingText.value.trim()) return;
  try {
    sending.value = true;
    const { data } = await api.get("/api/v1/employees/me");
    const me = data;

     await api.post("/api/v1/user-notifications", {
      employeeId: selectedEmployee.value.id,
      title: `🎉 Greeting from ${me.firstName}`,
      message: greetingText.value.trim(),
      senderId: me.id,
      senderName: `${me.firstName} ${me.lastName}`,
    });
    greetingModalOpen.value = false;
    alert("Greeting sent as in-app notification");
  } catch (err) {
    console.error("Failed to send greeting:", err);
    alert("Failed to send greeting.");
  } finally {
    sending.value = false;
  }
}
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
