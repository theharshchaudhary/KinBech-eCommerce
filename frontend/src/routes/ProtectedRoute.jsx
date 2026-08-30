import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import PageSpinner from '../components/ui/PageSpinner'

/** Requires any signed-in user (customer or staff). */
export function RequireAuth() {
  const { user, status } = useAuthStore()
  const location = useLocation()

  if (status !== 'ready') return <PageSpinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  return <Outlet />
}

/** Requires a staff account; optionally a specific permission. */
export function RequireStaff({ permission }) {
  const { user, status, can } = useAuthStore()

  if (status !== 'ready') return <PageSpinner />
  if (!user || user.account_type !== 'staff') return <Navigate to="/admin/login" replace />
  if (permission && !can(permission)) return <Navigate to="/admin" replace />

  return <Outlet />
}
