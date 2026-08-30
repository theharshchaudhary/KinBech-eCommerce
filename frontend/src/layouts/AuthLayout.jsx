import { Link, Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <Link to="/" className="mb-6 flex items-center justify-center gap-1 font-display text-2xl font-extrabold text-brand-700">
          Kin<span className="text-accent-500">Bech</span>
        </Link>
        <Outlet />
      </div>
    </div>
  )
}
