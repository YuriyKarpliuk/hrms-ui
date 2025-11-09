import axios from "axios"
import { getAccessToken, getRefreshToken, saveTokens, logout } from "../services/authService"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        logout()
        window.location.href = "/login"
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}/protocol/openid-connect/token`,
          new URLSearchParams({
            grant_type: "refresh_token",
            client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
            client_secret: import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET,
            refresh_token: refreshToken,
          }),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        )

        saveTokens({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in,
          refresh_expires_in: data.refresh_expires_in,
        })

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        logout()
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
