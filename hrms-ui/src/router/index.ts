import { createRouter, createWebHistory } from "vue-router"
import Login from "../views/Login.vue"
import Dashboard from "../views/Dashboard.vue"
import UserDashboard from "../views/UserDashboard.vue"
import Profile from "../views/Profile.vue"
import Employees from "../views/Employees.vue"
import LeavesUserView from "../views/LeavesUserView.vue"
import LeavesTeam from "../views/LeavesTeam.vue"
import Timesheets from "../views/Timesheets.vue"
import TimesheetsTeam from "../views/TimesheetsTeam.vue"
import TimesheetDetails from "../views/TimesheetDetails.vue"
import TimesheetLogs from "../views/TimesheetLogs.vue"
import Payrolls from "../views/Payrolls.vue"
import PayrollsTeam from "../views/PayrollsTeam.vue"
import { getAccessToken, getUserRoles } from "../services/authService"

const routes = [
  { path: "/login", name: "Login", component: Login },
  { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/user-dashboard", component: UserDashboard, meta: { roles: ["USER"] } },
  { path: "/profile", component: Profile, meta: { requiresAuth: true } },
  { path: "/employees", component: Employees, meta: { roles: ["ADMIN", "HR"] } },
  { path: "/leaves", component: LeavesUserView, meta: { roles: ["USER", "HR", "MANAGER", "ADMIN"] } },
  { path: "/manager/leaves", component: LeavesTeam, meta: { roles: ["MANAGER"] } },
  { path: "/timesheets", component: Timesheets, meta: { roles: ["USER", "HR", "MANAGER", "ADMIN"] } },
  { path: "/manager/timesheets", component: TimesheetsTeam, meta: { roles: ["MANAGER"] } },
  { path: "/timesheets/logs", component: TimesheetLogs, meta: { roles: ["USER", "HR", "MANAGER", "ADMIN"] } },
  { path: "/timesheets/:id", component: TimesheetDetails, meta: { roles: ["USER", "HR", "MANAGER", "ADMIN"] } },
  { path: "/payrolls", component: Payrolls, meta: { roles: ["USER", "MANAGER"], } },
  { path: "/manager/payrolls", component: PayrollsTeam, meta: { roles: ["MANAGER"], } },
  { path: "/", redirect: "/dashboard" },
  { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _, next) => {
  const token = getAccessToken()
  const roles = getUserRoles()

  if (to.meta.requiresAuth && !token) {
    next("/login")
    return
  }

  if (to.path === "/dashboard" && roles.includes("USER")) {
    next("/user-dashboard")
    return
  }

  if (to.meta.roles && !roles.some((r) => to.meta.roles.includes(r))) {
    next("/dashboard")
    return
  }

  next()
})

export default router
