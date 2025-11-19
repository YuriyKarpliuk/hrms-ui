import { createRouter, createWebHistory } from "vue-router"
import Login from "../views/Login.vue"
import UserDashboard from "../views/UserDashboard.vue"
import ManagerDashboard from "../views/ManagerDashboard.vue"
import HrDashboard from "../views/HrDashboard.vue"
import Profile from "../views/Profile.vue"
import MyOrganization from "../views/MyOrganization.vue"
import LeavesUserView from "../views/LeavesUserView.vue"
import LeavesTeam from "../views/LeavesTeam.vue"
import Timesheets from "../views/Timesheets.vue"
import TimesheetsTeam from "../views/TimesheetsTeam.vue"
import TimesheetDetails from "../views/TimesheetDetails.vue"
import TimesheetLogs from "../views/TimesheetLogs.vue"
import Payrolls from "../views/Payrolls.vue"
import PayrollsTeam from "../views/PayrollsTeam.vue"
import TimesheetTeamDetail from "../views/TimesheetTeamDetail.vue"
import EmployeesDirectory from "../views/EmployeesDirectory.vue"
import EmployeeSearchDetails from "../views/EmployeeSearchDetails.vue"
import Home from "../views/Home.vue"



import { getAccessToken, getUserRoles } from "../services/authService"

const routes = [
  { path: "/login", name: "Login", component: Login },
  { path: "/home", name: "Home", component: Home },
  { path: "/user-dashboard", component: UserDashboard, meta: { requiresAuth: true } },
  { path: "/manager-dashboard", component: ManagerDashboard, meta: { roles: ["MANAGER"] } },
  { path: "/hr-dashboard", component: HrDashboard, meta: { roles: ["HR"] } },
  { path: "/profile", component: Profile, meta: { requiresAuth: true } },
  { path: "/leaves", component: LeavesUserView, meta: { roles: ["USER", "HR", "MANAGER", "ADMIN"] } },
  { path: "/manager/leaves", component: LeavesTeam, meta: { roles: ["MANAGER"] } },
  { path: "/timesheets", component: Timesheets, meta: { roles: ["USER", "HR", "MANAGER", "ADMIN"] } },
  { path: "/manager/timesheets", component: TimesheetsTeam, meta: { roles: ["MANAGER"] } },
  { path: "/timesheets/logs", component: TimesheetLogs, meta: { roles: ["USER", "HR", "MANAGER", "ADMIN"] } },
  { path: "/timesheets/:id", component: TimesheetDetails, meta: { roles: ["USER", "HR", "MANAGER", "ADMIN"] } },
  { path: "/payrolls", component: Payrolls, meta: { roles: ["USER", "MANAGER"], } },
  { path: "/manager/payrolls", component: PayrollsTeam, meta: { roles: ["MANAGER"], } },
  { path: "/", redirect: "/user-dashboard" },
  { path: "/:pathMatch(.*)*", redirect: "/user-dashboard" },
  {
  path: '/timesheets/team/:id',
  name: 'TimesheetTeamDetail',
  component:TimesheetTeamDetail,
  props: true
},
{
  path: '/employees',
  component: EmployeesDirectory, meta: { roles: ["USER", "HR", "MANAGER", "ADMIN"] }
},
{
  path: '/search/employees/:id',
  component: EmployeeSearchDetails, meta: { roles: ["USER", "HR", "MANAGER", "ADMIN"] }

},
{
  path: "/my-organization",
  name: "MyOrganization",
  component: MyOrganization,
  meta: { roles: ["USER", "HR", "MANAGER", "ADMIN"] }
},

{
  path: "/birthdays",
  name: "Birthdays",
  component: () => import("../components/BirthdayDashboard.vue"),
  meta: {
    requiresAuth: true,
    roles: ["MANAGER", "HR", "ADMIN", "USER"],
  },
},
{
  path: "/hr/employees/create",
  component: () => import("../views/HrEmployeeCreate.vue"),
  meta: { requiresHR: true }
},
{
  path: "/hr/employees/:id/edit",
  component: () => import("../views/HrEmployeeEdit.vue"),
  meta: { requiresHR: true }
},
{
  path: "/hr/tasks",
  name: "HrTasks",
  component: () => import("../views/HrTaskView.vue"),
  meta: { requiresAuth: true, roles: ["HR", "ADMIN"] }
},

  { path: "/admin-dashboard", component: () => import("../views/AdminDashboard.vue"), meta: { roles: ["ADMIN"] } },
  { path: "/admin/organizations", component: () => import("../views/AdminOrganizations.vue"), meta: { roles: ["ADMIN"] } },
  { path: "/admin/departments", component: () => import("../views/AdminDepartments.vue"), meta: { roles: ["ADMIN"] } },
  { path: "/admin/logs", component: () => import("../views/AdminLogs.vue"), meta: { roles: ["ADMIN"] } },


]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _, next) => {
  const token = getAccessToken()
  const roles = getUserRoles()

  if (!token && to.path !== "/login") {
    next("/login")
    return
  }

  if (roles.includes("ADMIN") && to.path === "/user-dashboard") {
    next("/admin-dashboard")
    return
  }

  if (roles.includes("ADMIN") && (to.path === "/" || to.path === "/home")) {
    next("/admin-dashboard")
    return
  }

  if (to.meta.roles && !roles.some((r) => to.meta.roles.includes(r))) {
    if (roles.includes("ADMIN")) {
      next("/admin-dashboard")
    } else {
      next("/user-dashboard")
    }
    return
  }

  next()
})


export default router
