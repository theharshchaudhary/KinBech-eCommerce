import client from './client'

export async function getCategories() {
  const res = await client.get('/categories')
  return res.data.data
}

export async function getBrands() {
  const res = await client.get('/brands')
  return res.data.data
}

export async function getProducts(params = {}) {
  const res = await client.get('/products', { params })
  return res.data
}

export async function getProduct(slug) {
  const res = await client.get(`/products/${slug}`)
  return res.data.data
}

export async function getRelatedProducts(slug) {
  const res = await client.get(`/products/${slug}/related`)
  return res.data.data
}

export async function getProductReviews(productId, page = 1) {
  const res = await client.get(`/products/${productId}/reviews`, { params: { page } })
  return res.data
}

export async function submitReview(data) {
  const res = await client.post('/reviews', data)
  return res.data.data
}
