import { defineStore } from "pinia"
import { login, logout, getAccessToken, refreshAccessToken } from "../services/authService"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: getAccessToken(),
    user: null as any,
    loading: false,
  }),
  actions: {
    async loginUser(username: string, password: string) {
      try {
        this.loading = true
        const data = await login(username, password)
        this.token = data.access_token
      } catch (err) {
        console.error("Login failed:", err)
        throw err
      } finally {
        this.loading = false
      }
    },
    async refresh() {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        this.token = getAccessToken()
      }
    },
    logoutUser() {
      logout()
      this.token = null
      this.user = null
    },
  },
})
