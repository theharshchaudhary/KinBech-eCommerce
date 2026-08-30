import client from './client'

// ---- Dashboard ----
export const getDashboard = () => client.get('/admin/dashboard').then((r) => r.data)

// ---- Products ----
export const adminGetProducts = (params) => client.get('/admin/products', { params }).then((r) => r.data)
export const adminGetProduct = (id) => client.get(`/admin/products/${id}`).then((r) => r.data.data)
export const adminCreateProduct = (data) => client.post('/admin/products', data).then((r) => r.data.data)
export const adminUpdateProduct = (id, data) => client.put(`/admin/products/${id}`, data).then((r) => r.data.data)
export const adminDeleteProduct = (id) => client.delete(`/admin/products/${id}`)
export const adminUploadProductImages = (id, formData) =>
  client.post(`/admin/products/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.data)
export const adminSetPrimaryImage = (productId, imageId) =>
  client.post(`/admin/products/${productId}/images/${imageId}/primary`).then((r) => r.data.data)
export const adminDeleteProductImage = (productId, imageId) => client.delete(`/admin/products/${productId}/images/${imageId}`)
export const adminCreateVariant = (productId, data) => client.post(`/admin/products/${productId}/variants`, data).then((r) => r.data.data)
export const adminUpdateVariant = (productId, variantId, data) =>
  client.put(`/admin/products/${productId}/variants/${variantId}`, data).then((r) => r.data.data)
export const adminDeleteVariant = (productId, variantId) => client.delete(`/admin/products/${productId}/variants/${variantId}`)

// ---- Categories ----
export const adminGetCategories = () => client.get('/admin/categories').then((r) => r.data.data)
export const adminCreateCategory = (data) => client.post('/admin/categories', data).then((r) => r.data.data)
export const adminUpdateCategory = (id, data) => client.post(`/admin/categories/${id}`, data).then((r) => r.data.data)
export const adminDeleteCategory = (id) => client.delete(`/admin/categories/${id}`)

// ---- Brands ----
export const adminGetBrands = () => client.get('/admin/brands').then((r) => r.data.data)
export const adminCreateBrand = (data) => client.post('/admin/brands', data).then((r) => r.data.data)
export const adminUpdateBrand = (id, data) => client.post(`/admin/brands/${id}`, data).then((r) => r.data.data)
export const adminDeleteBrand = (id) => client.delete(`/admin/brands/${id}`)

// ---- Orders ----
export const adminGetOrders = (params) => client.get('/admin/orders', { params }).then((r) => r.data)
export const adminGetOrder = (id) => client.get(`/admin/orders/${id}`).then((r) => r.data.data)
export const adminUpdateOrderStatus = (id, data) => client.patch(`/admin/orders/${id}/status`, data).then((r) => r.data.data)
export const adminUpdatePaymentStatus = (id, payment_status) =>
  client.patch(`/admin/orders/${id}/payment-status`, { payment_status }).then((r) => r.data.data)

// ---- Customers ----
export const adminGetCustomers = (params) => client.get('/admin/customers', { params }).then((r) => r.data)
export const adminGetCustomer = (id) => client.get(`/admin/customers/${id}`).then((r) => r.data)
export const adminToggleCustomerActive = (id) => client.patch(`/admin/customers/${id}/toggle-active`).then((r) => r.data.data)

// ---- Staff & Roles (granular access control) ----
export const adminGetStaff = (params) => client.get('/admin/staff', { params }).then((r) => r.data)
export const adminCreateStaff = (data) => client.post('/admin/staff', data).then((r) => r.data.data)
export const adminUpdateStaff = (id, data) => client.put(`/admin/staff/${id}`, data).then((r) => r.data.data)
export const adminDeleteStaff = (id) => client.delete(`/admin/staff/${id}`)

export const adminGetRoles = () => client.get('/admin/roles').then((r) => r.data)
export const adminGetPermissionMatrix = () => client.get('/admin/permissions').then((r) => r.data)
export const adminCreateRole = (data) => client.post('/admin/roles', data).then((r) => r.data)
export const adminUpdateRole = (id, data) => client.put(`/admin/roles/${id}`, data).then((r) => r.data)
export const adminDeleteRole = (id) => client.delete(`/admin/roles/${id}`)

// ---- Coupons ----
export const adminGetCoupons = () => client.get('/admin/coupons').then((r) => r.data.data)
export const adminCreateCoupon = (data) => client.post('/admin/coupons', data).then((r) => r.data.data)
export const adminUpdateCoupon = (id, data) => client.put(`/admin/coupons/${id}`, data).then((r) => r.data.data)
export const adminDeleteCoupon = (id) => client.delete(`/admin/coupons/${id}`)

// ---- Reviews ----
export const adminGetReviews = (params) => client.get('/admin/reviews', { params }).then((r) => r.data)
export const adminApproveReview = (id) => client.patch(`/admin/reviews/${id}/approve`).then((r) => r.data.data)
export const adminDeleteReview = (id) => client.delete(`/admin/reviews/${id}`)

// ---- Messages ----
export const adminGetMessages = (params) => client.get('/admin/messages', { params }).then((r) => r.data)
export const adminGetMessage = (id) => client.get(`/admin/messages/${id}`).then((r) => r.data)
export const adminDeleteMessage = (id) => client.delete(`/admin/messages/${id}`)

// ---- Settings ----
export const adminGetSettings = () => client.get('/admin/settings').then((r) => r.data)
export const adminUpdateSettings = (group, data) => client.put(`/admin/settings/${group}`, data).then((r) => r.data)
export const adminSendTestMail = (to) => client.post('/admin/settings/mail/test', { to }).then((r) => r.data)
