import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Heart, Menu as MenuIcon, Phone, Search, ShoppingCart, User, X, ChevronDown, LogOut, Package, MapPinned } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import useUiStore from '../../store/uiStore'
import { useCategories, usePublicSettings } from '../../hooks/useCatalog'
import { useCartQuery, useWishlistQuery } from '../../hooks/useCart'

export default function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { data: categories } = useCategories()
  const { data: settings } = usePublicSettings()
  const { data: cart } = useCartQuery()
  const { data: wishlist } = useWishlistQuery()
  const { openCartDrawer, mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUiStore()
  const [search, setSearch] = useState('')

  const cartCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0
  const wishlistCount = wishlist?.length || 0

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/shop?q=${encodeURIComponent(search)}`)
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="hidden bg-brand-950 text-slate-200 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
          <span className="flex items-center gap-1.5">
            <Phone size={12} /> {settings?.general?.support_phone || '+977-1-4000000'} &nbsp;•&nbsp; Free shipping over{' '}
            {settings?.general?.currency_symbol || 'Rs.'} {settings?.shipping?.free_shipping_threshold || 5000}
          </span>
          <span className="flex items-center gap-4">
            <Link to="/orders" className="hover:text-white">Track Order</Link>
            <Link to="/contact" className="hover:text-white">Help Center</Link>
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <button onClick={toggleMobileMenu} className="text-slate-600 lg:hidden">
          {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>

        <Link to="/" className="flex items-center gap-1 font-display text-2xl font-extrabold text-brand-700">
          Kin<span className="text-accent-500">Bech</span>
        </Link>

        <form onSubmit={handleSearch} className="mx-2 hidden flex-1 items-center md:flex">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for products, brands and more"
            className="w-full rounded-l-full border border-r-0 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          />
          <button className="flex items-center gap-1 rounded-r-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            <Search size={16} />
          </button>
        </form>

        <div className="ml-auto flex items-center gap-4 sm:gap-5">
          <Link to="/wishlist" className="relative hidden text-slate-600 hover:text-brand-600 sm:block">
            <Heart size={22} />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button onClick={openCartDrawer} className="relative text-slate-600 hover:text-brand-600">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>

          <Menu as="div" className="relative">
            <MenuButton className="flex items-center gap-1.5 text-slate-600 hover:text-brand-600">
              <User size={22} />
              <span className="hidden text-sm font-medium lg:inline">{user ? user.name.split(' ')[0] : 'Sign In'}</span>
              <ChevronDown size={14} className="hidden lg:inline" />
            </MenuButton>
            <MenuItems anchor="bottom end" className="z-50 mt-2 w-52 origin-top-right rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg focus:outline-none">
              {user ? (
                <>
                  <div className="px-3 py-2 text-xs text-slate-400">Signed in as<br /><span className="font-semibold text-slate-700">{user.email}</span></div>
                  <MenuItem>
                    <Link to="/account/orders" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 data-focus:bg-slate-50">
                      <Package size={15} /> My Orders
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link to="/account/addresses" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 data-focus:bg-slate-50">
                      <MapPinned size={15} /> Addresses
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 data-focus:bg-red-50">
                      <LogOut size={15} /> Logout
                    </button>
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem>
                    <Link to="/login" className="block rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 data-focus:bg-slate-50">Sign In</Link>
                  </MenuItem>
                  <MenuItem>
                    <Link to="/register" className="block rounded-lg px-3 py-2 text-sm text-slate-700 data-focus:bg-slate-50">Create Account</Link>
                  </MenuItem>
                </>
              )}
            </MenuItems>
          </Menu>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex items-center px-4 pb-3 md:hidden">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-l-full border border-r-0 border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
        />
        <button className="rounded-r-full bg-brand-600 px-4 py-2 text-white"><Search size={16} /></button>
      </form>

      <nav className="hidden border-t border-slate-100 bg-slate-50 lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-2.5 text-sm font-medium text-slate-600">
          {(categories || []).map((cat) => (
            <div key={cat.id} className="group relative">
              <Link to={`/shop?category=${cat.slug}`} className="hover:text-brand-700">{cat.name}</Link>
              {cat.children?.length > 0 && (
                <div className="absolute left-0 top-full z-40 hidden min-w-[190px] rounded-lg border border-slate-100 bg-white py-2 shadow-lg group-hover:block">
                  {cat.children.map((child) => (
                    <Link key={child.id} to={`/shop?category=${child.slug}`} className="block px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-700">
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link to="/about" className="hover:text-brand-700">About</Link>
          <Link to="/contact" className="hover:text-brand-700">Contact</Link>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            {(categories || []).map((cat) => (
              <Link key={cat.id} to={`/shop?category=${cat.slug}`} onClick={closeMobileMenu} className="rounded-lg px-2 py-2 hover:bg-slate-50">
                {cat.name}
              </Link>
            ))}
            <Link to="/about" onClick={closeMobileMenu} className="rounded-lg px-2 py-2 hover:bg-slate-50">About</Link>
            <Link to="/contact" onClick={closeMobileMenu} className="rounded-lg px-2 py-2 hover:bg-slate-50">Contact</Link>
          </div>
        </div>
      )}
    </header>
  )
}
