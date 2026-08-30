import client, { ensureCsrfCookie } from './client'

export async function register(data) {
  await ensureCsrfCookie()
  const res = await client.post('/auth/register', data)
  return res.data.data
}

export async function login(data) {
  await ensureCsrfCookie()
  const res = await client.post('/auth/login', data)
  return res.data.data
}

export async function logout() {
  await client.post('/auth/logout')
}

export async function me() {
  const res = await client.get('/auth/me')
  return res.data.data
}
