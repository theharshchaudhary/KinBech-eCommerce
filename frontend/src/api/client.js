import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: 'application/json' },
})

/**
 * Laravel Sanctum SPA auth is cookie-based: before any state-changing
 * request we must first hit /sanctum/csrf-cookie so the server issues the
 * XSRF-TOKEN cookie that axios then echoes back as the X-XSRF-TOKEN header.
 */
export async function ensureCsrfCookie() {
  await axios.get(`${API_URL}/sanctum/csrf-cookie`, { withCredentials: true })
}

client.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase()
  if (method !== 'get') {
    await ensureCsrfCookie()
  }
  return config
})

export default client
