import axios from "axios"
import { jwtDecode } from 'jwt-decode';
const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL
const realm = import.meta.env.VITE_KEYCLOAK_REALM
const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID
const clientSecret = import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET

export interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
}

interface DecodedToken {
  realm_access?: { roles: string[] }
  resource_access?: Record<string, { roles: string[] }>
  preferred_username?: string
  email?: string
}


export function getUserRoles(): string[] {
  const token = getAccessToken()
  if (!token) return []
  try {
    const decoded = jwtDecode<DecodedToken>(token)
    return decoded.realm_access?.roles || []
  } catch (err) {
    console.error("Failed to decode token:", err)
    return []
  }
}

export async function login(username: string, password: string): Promise<TokenResponse> {
  const url = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`

  const formData = new URLSearchParams()
  formData.append("grant_type", "password")
  formData.append("client_id", clientId)
  formData.append("client_secret", clientSecret)
  formData.append("username", username)
  formData.append("password", password)

  const { data } = await axios.post<TokenResponse>(url, formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })

  saveTokens(data)
  return data
}

export function saveTokens(data: TokenResponse) {
  localStorage.setItem("access_token", data.access_token)
  localStorage.setItem("refresh_token", data.refresh_token)
  localStorage.setItem("token_expires", (Date.now() + data.expires_in * 1000).toString())
}

export function getAccessToken(): string | null {
  return localStorage.getItem("access_token")
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refresh_token")
}

export function isTokenExpired(): boolean {
  const expiresAt = localStorage.getItem("token_expires")
  return !expiresAt || Date.now() > Number(expiresAt)
}

export async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken()
  if (!refresh) return false

  try {
    const url = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`
    const formData = new URLSearchParams()
    formData.append("grant_type", "refresh_token")
    formData.append("client_id", clientId)
    formData.append("client_secret", clientSecret)
    formData.append("refresh_token", refresh)

    const { data } = await axios.post<TokenResponse>(url, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })

    saveTokens(data)
    return true
  } catch (err) {
    console.error("Failed to refresh token:", err)
    logout()
    return false
  }
}

export function logout() {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("token_expires")
}
