import client from './client'

export async function getCart() {
  const res = await client.get('/cart')
  return res.data
}

export async function addToCart(data) {
  const res = await client.post('/cart', data)
  return res.data.data
}

export async function updateCartItem(id, quantity) {
  const res = await client.patch(`/cart/${id}`, { quantity })
  return res.data.data
}

export async function removeCartItem(id) {
  await client.delete(`/cart/${id}`)
}

export async function clearCart() {
  await client.delete('/cart')
}

export async function getWishlist() {
  const res = await client.get('/wishlist')
  return res.data.data
}

export async function toggleWishlist(productId) {
  const res = await client.post('/wishlist/toggle', { product_id: productId })
  return res.data
}

export async function removeWishlistItem(id) {
  await client.delete(`/wishlist/${id}`)
}
