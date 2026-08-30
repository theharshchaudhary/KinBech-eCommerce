import client from './client'

export async function submitContactMessage(data) {
  const res = await client.post('/contact', data)
  return res.data
}

export async function getPublicSettings() {
  const res = await client.get('/settings/public')
  return res.data
}
