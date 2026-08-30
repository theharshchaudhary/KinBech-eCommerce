import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import useAuthStore from './store/authStore'

import StorefrontLayout from './layouts/StorefrontLayout'
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'
import { RequireAuth, RequireStaff } from './routes/ProtectedRoute'

import Home from './pages/storefront/Home'
import Shop from './pages/storefront/Shop'
import ProductDetail from './pages/storefront/ProductDetail'
import Cart from './pages/storefront/Cart'
import Wishlist from './pages/storefront/Wishlist'
import Checkout from './pages/storefront/Checkout'
import OrderConfirmation from './pages/storefront/OrderConfirmation'
import Orders from './pages/storefront/Orders'
import OrderDetail from './pages/storefront/OrderDetail'
import Addresses from './pages/storefront/Addresses'
import AccountLayout, { ProfileForm } from './pages/storefront/Profile'
import Login from './pages/storefront/Login'
import Register from './pages/storefront/Register'
import About from './pages/storefront/About'
import Contact from './pages/storefront/Contact'
import NotFound from './pages/NotFound'

import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import ProductForm from './pages/admin/ProductForm'
import Categories from './pages/admin/Categories'
import Brands from './pages/admin/Brands'
import AdminOrders from './pages/admin/Orders'
import AdminOrderDetail from './pages/admin/OrderDetail'
import Customers from './pages/admin/Customers'
import CustomerDetail from './pages/admin/CustomerDetail'
import Coupons from './pages/admin/Coupons'
import Reviews from './pages/admin/Reviews'
import Messages from './pages/admin/Messages'
import Staff from './pages/admin/Staff'
import Settings from './pages/admin/Settings'

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="products/:slug" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />

        <Route element={<RequireAuth />}>
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="account/orders/:id" element={<OrderDetail />} />

          <Route path="account" element={<AccountLayout />}>
            <Route index element={<ProfileForm />} />
            <Route path="orders" element={<Orders />} />
            <Route path="addresses" element={<Addresses />} />
          </Route>
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      <Route path="admin/login" element={<AdminLogin />} />

      <Route path="admin" element={<RequireStaff />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="brands" element={<Brands />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="messages" element={<Messages />} />
          <Route path="staff" element={<Staff />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
