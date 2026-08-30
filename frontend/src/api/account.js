import client from './client'

export async function updateProfile(data) {
  const res = await client.put('/account/profile', data)
  return res.data.data
}

export async function getAddresses() {
  const res = await client.get('/addresses')
  return res.data.data
}

export async function createAddress(data) {
  const res = await client.post('/addresses', data)
  return res.data.data
}

export async function updateAddress(id, data) {
  const res = await client.put(`/addresses/${id}`, data)
  return res.data.data
}

export async function deleteAddress(id) {
  await client.delete(`/addresses/${id}`)
}

export async function applyCoupon(code, subtotal) {
  const res = await client.post('/coupons/apply', { code, subtotal })
  return res.data
}

export async function placeOrder(data) {
  const res = await client.post('/checkout', data)
  return res.data.data
}

export async function getOrders(page = 1) {
  const res = await client.get('/orders', { params: { page } })
  return res.data
}

export async function getOrder(id) {
  const res = await client.get(`/orders/${id}`)
  return res.data.data
}

export async function cancelOrder(id, reason) {
  const res = await client.post(`/orders/${id}/cancel`, { reason })
  return res.data.data
}
