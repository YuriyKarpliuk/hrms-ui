<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
    <div class="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
      <div class="flex justify-between items-center border-b border-gray-700 p-5">
        <div>
          <h1 class="text-2xl font-bold text-orange-500">Timesheet Logs</h1>
          <p class="text-sm text-gray-400">{{ formattedPeriod }}</p>
        </div>

        <div class="flex items-center gap-3">
          <div class="relative">
            <button
              @click="showDropdown = !showDropdown"
              class="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              {{ logType }}
              <i class="fa-solid fa-chevron-down text-xs"></i>
            </button>
            <div
              v-if="showDropdown"
              class="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-700 z-50"
            >
              <ul class="text-sm text-gray-700 dark:text-gray-200 w-40">
                <li
                  v-for="type in logTypes"
                  :key="type"
                  @click="selectLogType(type)"
                  class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  {{ type }}
                </li>
              </ul>
            </div>
          </div>

          <input
            v-if="logType === 'Daily Log'"
            type="date"
            v-model="selectedDate"
            @change="generateEntries"
            class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm"
          />

          <input
            v-else-if="logType === 'Weekly Log'"
            type="week"
            v-model="selectedWeek"
            @change="handleWeekSelection"
            class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm"
          />

          <input
            v-else-if="logType === 'Monthly Log'"
            type="month"
            v-model="selectedMonth"
            @change="generateEntries"
            class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm"
          />
        </div>
      </div>

      <div v-if="entries.length === 0" class="flex flex-col items-center justify-center text-center py-20 text-gray-500">
        <img
          src="https://cdn-icons-png.flaticon.com/512/7466/7466020.png"
          alt="Empty"
          class="w-32 mb-4 opacity-70"
        />
        <p>No time logs yet. Select a date, week, or month to start logging.</p>
      </div>

      <div v-else class="p-6 overflow-x-auto">
        <table class="min-w-full border-collapse text-sm">
          <thead class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase">
            <tr>
              <th class="py-3 px-4 text-left">Date</th>
              <th class="py-3 px-4 text-left">Activity Type</th>
              <th class="py-3 px-4 text-left">Description</th>
              <th class="py-3 px-4 text-center">Hours</th>
              <th class="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entry, i) in entries"
              :key="entry.tempId"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-600 transition"
            >
              <td class="py-3 px-4 font-medium">{{ formatDate(entry.workDate) }}</td>
              <td class="py-3 px-4">
                <select v-model="entry.activityType" class="input-select" :disabled="entry.autoLeave">
                  <option disabled value="">Select Activity</option>
                  <option
                    v-for="type in activityTypes"
                    :key="type"
                    :value="type"
                    :disabled="['VACATION', 'SICK', 'UNPAID'].includes(type)"
                  >
                    {{ type }}
                  </option>
                </select>
              </td>
              <td class="py-3 px-4">
                <input
                  v-model="entry.notes"
                  placeholder="Enter notes"
                  class="input-field"
                  :disabled="entry.autoLeave"
                />
              </td>
              <td class="py-3 px-4 text-center">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  v-model.number="entry.hours"
                  class="input-hours"
                  :disabled="entry.autoLeave"
                />
              </td>
              <td class="py-3 px-4 text-center">
                <button
                  v-if="!entry.autoLeave"
                  @click="removeEntry(i)"
                  class="text-red-500 hover:text-red-400 text-lg"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-4 flex justify-between items-center text-gray-500 dark:text-gray-400 text-sm">
          <div>
            Total hours:
            <span class="font-semibold text-gray-800 dark:text-gray-100">{{ totalHours.toFixed(2) }}</span>
          </div>
          <button @click="resetEntries" class="text-orange-500 hover:underline font-medium">Reset All</button>
        </div>
      </div>

      <div
        v-if="entries.length > 0"
        class="flex justify-end gap-3 px-8 py-5 bg-gray-100 dark:bg-gray-800 rounded-b-2xl mt-[-1px]"
      >
        <button @click="cancelLog" class="btn-gray">Cancel</button>
        <button @click="saveLogs" class="btn-orange">Save</button>
      </div>

      <transition name="fade">
        <div
          v-if="toast.visible"
          :class="[
            'fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300',
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          ]"
        >
          {{ toast.message }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import api from "../lib/api";

interface Entry {
  tempId: string;
  workDate: string;
  activityType: string;
  notes: string;
  hours: number;
  autoLeave?: boolean;
}

const router = useRouter();
const currentUserId = localStorage.getItem("currentUserId");
const currentTimesheetId = ref<number | null>(null);
const showDropdown = ref(false);
const logTypes = ["Daily Log", "Weekly Log", "Monthly Log"];
const activityTypes = ["REGULAR", "OVERTIME", "VACATION", "SICK", "UNPAID", "TRAINING", "SUPPORT"];
const logType = ref("Daily Log");
const entries = ref<Entry[]>([]);
const selectedDate = ref("");
const selectedWeek = ref("");
const selectedMonth = ref("");
const toast = ref({ visible: false, message: "", type: "success" as "success" | "error" });

function ymdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function showToast(msg: string, type: "success" | "error" = "success") {
  toast.value = { visible: true, message: msg, type };
  setTimeout(() => (toast.value.visible = false), 3000);
}

function selectLogType(type: string) {
  logType.value = type;
  showDropdown.value = false;
  entries.value = [];
  selectedDate.value = "";
  selectedWeek.value = "";
  selectedMonth.value = "";
}

function handleWeekSelection(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  if (!value) return;
  const [yearStr, weekStr] = value.split("-W");
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);

  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dayOfWeek = simple.getDay();
  const monday = new Date(simple);
  monday.setDate(simple.getDate() - ((dayOfWeek + 6) % 7));

  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(ymdLocal(d));
  }

  selectedWeek.value = value;
  generateEntriesForWeek(weekDates);
}

async function generateEntriesForWeek(dates: string[]) {
  entries.value = [];
  const { data: leaves } = await api
    .get(`/api/v1/leaves/approved?employeeId=${currentUserId}&from=${dates[0]}&to=${dates.at(-1)}`)
    .catch(() => ({ data: [] }));

  for (const date of dates) {
    const leave = leaves.find((l: any) => l.date === date);
    entries.value.push({
      tempId: Math.random().toString(36).slice(2),
      workDate: date,
      activityType: leave ? leave.type.toUpperCase() : "",
      notes: leave ? `Approved leave: ${leave.type}` : "",
      hours: 0,
      autoLeave: !!leave,
    });
  }
}

async function generateEntries() {
  entries.value = [];
  const dates: string[] = [];
  if (logType.value === "Daily Log" && selectedDate.value) dates.push(selectedDate.value);
  else if (logType.value === "Monthly Log" && selectedMonth.value) {
    const [year, month] = selectedMonth.value.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month - 1, i);
      dates.push(ymdLocal(date));
    }
  }

  if (!dates.length) return;
  const { data: leaves } = await api
    .get(`/api/v1/leaves/approved?employeeId=${currentUserId}&from=${dates[0]}&to=${dates.at(-1)}`)
    .catch(() => ({ data: [] }));

  for (const date of dates) {
    const leave = leaves.find((l: any) => l.date === date);
    entries.value.push({
      tempId: Math.random().toString(36).slice(2),
      workDate: date,
      activityType: leave ? leave.type.toUpperCase() : "",
      notes: leave ? `Approved leave: ${leave.type}` : "",
      hours: 0,
      autoLeave: !!leave,
    });
  }
}

function removeEntry(i: number) {
  entries.value.splice(i, 1);
}
function resetEntries() {
  if (logType.value === "Weekly Log" && selectedWeek.value) handleWeekSelection({ target: { value: selectedWeek.value } } as any);
  else generateEntries();
}
function cancelLog() {
  entries.value = [];
  selectedDate.value = "";
  selectedWeek.value = "";
  selectedMonth.value = "";
}

async function saveLogs() {
  if (!entries.value.length) return;
  const payload = {
    employeeId: Number(currentUserId),
    weekStart: entries.value[0].workDate,
    weekEnd: entries.value.at(-1)?.workDate,
    entries: entries.value.filter((e) => e.activityType && e.activityType.trim() !== ""),
  };
  try {
    const { data } = await api.post("/api/v1/timesheets", payload);
    currentTimesheetId.value = data.id;
    showToast("Timesheet created successfully!");
    setTimeout(() => router.push("/timesheets"), 1200);
  } catch (err) {
    console.error("Error saving logs:", err);
    showToast("Failed to save logs", "error");
  }
}

const totalHours = computed(() => entries.value.reduce((sum, e) => sum + (e.hours || 0), 0));
const formattedPeriod = computed(() => {
  if (logType.value === "Daily Log" && selectedDate.value) return formatDate(selectedDate.value);
  if (logType.value === "Weekly Log" && selectedWeek.value) return "Week " + selectedWeek.value.replace("W", " ");
  if (logType.value === "Monthly Log" && selectedMonth.value) return "Month: " + selectedMonth.value;
  return "No period selected";
});
function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });
}
</script>

<style scoped>
.input-select {
  @apply w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm;
}
.input-field {
  @apply w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm;
}
.input-hours {
  @apply w-20 text-center rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700;
}
.btn-gray {
  @apply px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition;
}
.btn-orange {
  @apply px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
