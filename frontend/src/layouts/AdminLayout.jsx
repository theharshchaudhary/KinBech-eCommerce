import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  ShoppingCart,
  Users,
  UserCog,
  TicketPercent,
  Star,
  MessageSquare,
  Settings,
  LogOut,
  Menu as MenuIcon,
} from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../store/authStore'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard.view', end: true },
  { to: '/admin/products', label: 'Products', icon: Package, permission: 'products.view' },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree, permission: 'categories.manage' },
  { to: '/admin/brands', label: 'Brands', icon: Tag, permission: 'brands.manage' },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, permission: 'orders.view' },
  { to: '/admin/customers', label: 'Customers', icon: Users, permission: 'customers.view' },
  { to: '/admin/coupons', label: 'Coupons', icon: TicketPercent, permission: 'coupons.manage' },
  { to: '/admin/reviews', label: 'Reviews', icon: Star, permission: 'reviews.moderate' },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare, permission: 'messages.manage' },
  { to: '/admin/staff', label: 'Staff & Roles', icon: UserCog, permission: 'admins.manage' },
  { to: '/admin/settings', label: 'Settings', icon: Settings, permission: 'settings.manage' },
]

export default function AdminLayout() {
  const { user, can, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const items = NAV.filter((item) => can(item.permission))

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-brand-950 text-slate-300 transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-5 font-display text-xl font-extrabold text-white">
          Kin<span className="text-accent-500">Bech</span> <span className="text-xs font-normal text-slate-400">Admin</span>
        </div>
        <nav className="space-y-0.5 px-3 py-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon size={17} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-white/10 p-3">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white">
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-20 bg-black/30 lg:hidden" />}

      <div className="flex-1 lg:pl-0">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-500 lg:hidden">
            <MenuIcon size={22} />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.roles?.join(', ')}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>
        <main className="p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
