import { ShieldCheck, Truck, Users, Award } from 'lucide-react'
import { usePublicSettings } from '../../hooks/useCatalog'

const stats = [
  { icon: Users, label: 'Happy Customers', value: '50,000+' },
  { icon: Award, label: 'Products Listed', value: '10,000+' },
  { icon: Truck, label: 'Cities Served', value: '75+' },
  { icon: ShieldCheck, label: 'Secure Orders', value: '100%' },
]

export default function About() {
  const { data: settings } = usePublicSettings()

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 py-16 text-center text-white">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">About {settings?.general?.site_name || 'KinBech'}</h1>
        <p className="mx-auto mt-3 max-w-xl text-brand-100">
          {settings?.general?.tagline || 'Everything you need, delivered.'}
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Our Story</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              KinBech started with a simple idea: shopping online should be fast, transparent, and genuinely enjoyable.
              What began as a small catalog has grown into a full-scale marketplace offering electronics, home
              appliances, fashion, and more — all backed by reliable delivery and a support team that actually cares.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              We work directly with trusted brands and sellers to bring you competitive prices without compromising on
              quality or authenticity.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Why Shop With Us</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>✓ Curated catalog with verified customer reviews</li>
              <li>✓ Cash on delivery and secure checkout options</li>
              <li>✓ Fast, trackable shipping nationwide</li>
              <li>✓ Hassle-free 7-day returns</li>
              <li>✓ Dedicated customer support</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-6 rounded-2xl bg-white p-8 shadow-sm sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className="mx-auto mb-2 text-brand-600" size={26} />
              <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
