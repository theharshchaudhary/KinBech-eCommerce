import { Link } from 'react-router-dom'
import { Mail, Phone, Truck, ShieldCheck, RotateCcw, Headset } from 'lucide-react'
import { FaFacebookF, FaInstagram, FaXTwitter } from 'react-icons/fa6'
import { usePublicSettings } from '../../hooks/useCatalog'

const perks = [
  { icon: Truck, title: 'Fast Delivery', desc: 'Nationwide shipping' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: 'COD & protected checkout' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
  { icon: Headset, title: '24/7 Support', desc: "We're here to help" },
]

export default function Footer() {
  const { data: settings } = usePublicSettings()
  const social = settings?.social || {}

  return (
    <footer className="mt-16 bg-brand-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 border-b border-white/10 px-4 py-8 sm:grid-cols-4">
        {perks.map((p) => (
          <div key={p.title} className="flex items-center gap-3">
            <p.icon size={26} className="shrink-0 text-accent-400" />
            <div>
              <p className="text-sm font-semibold text-white">{p.title}</p>
              <p className="text-xs text-slate-400">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 md:grid-cols-5">
        <div className="col-span-2">
          <Link to="/" className="font-display text-2xl font-extrabold text-white">
            Kin<span className="text-accent-500">Bech</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-slate-400">
            {settings?.general?.tagline || 'Everything you need, delivered.'}
          </p>
          <div className="mt-4 flex gap-3">
            {social.facebook && (
              <a href={social.facebook} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 p-2 hover:bg-white/20">
                <FaFacebookF size={16} />
              </a>
            )}
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 p-2 hover:bg-white/20">
                <FaInstagram size={16} />
              </a>
            )}
            {social.twitter && (
              <a href={social.twitter} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 p-2 hover:bg-white/20">
                <FaXTwitter size={16} />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Company</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Account</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/account/orders" className="hover:text-white">My Orders</Link></li>
            <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
            <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Contact</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-2"><Phone size={14} /> {settings?.general?.support_phone || '+977-1-4000000'}</li>
            <li className="flex items-center gap-2"><Mail size={14} /> {settings?.general?.support_email || 'support@kinbech.test'}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {settings?.general?.site_name || 'KinBech'}. All rights reserved.
      </div>
    </footer>
  )
}
