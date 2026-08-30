import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import { useCategories, useProducts } from '../../hooks/useCatalog'
import ProductGrid from '../../components/product/ProductGrid'
import Button from '../../components/ui/Button'

function SectionHeading({ eyebrow, title, viewAllHref }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        {eyebrow && <p className="text-xs font-bold uppercase tracking-widest text-accent-500">{eyebrow}</p>}
        <h2 className="font-display text-2xl font-bold text-slate-900">{title}</h2>
      </div>
      {viewAllHref && (
        <Link to={viewAllHref} className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800 sm:flex">
          View all <ArrowRight size={15} />
        </Link>
      )}
    </div>
  )
}

export default function Home() {
  const { data: categories } = useCategories()
  const { data: featured, isLoading: loadingFeatured } = useProducts({ featured: true, per_page: 8 })
  const { data: trending, isLoading: loadingTrending } = useProducts({ sort: 'popularity', per_page: 8 })

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-accent-300">
              <Sparkles size={13} /> New Season Deals
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              Shop Smarter. <br /> Live Better.
            </h1>
            <p className="mt-4 max-w-md text-brand-100">
              Electronics, appliances, fashion and more — all in one place, with fast delivery and prices you'll love.
            </p>
            <div className="mt-7 flex gap-3">
              <Button as={Link} to="/shop" variant="accent" size="lg">
                Shop Now <ArrowRight size={17} />
              </Button>
              <Button as={Link} to="/shop?sort=price_asc" variant="outline-inverse" size="lg">
                Today's Deals
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="grid grid-cols-2 gap-4">
              {(featured?.data || []).slice(0, 4).map((p) => (
                <Link key={p.id} to={`/products/${p.slug}`} className="rounded-2xl bg-white/10 p-3 backdrop-blur transition hover:bg-white/20">
                  <img src={p.image} alt={p.name} className="mx-auto h-24 w-24 object-contain drop-shadow-xl" />
                  <p className="mt-2 line-clamp-1 text-xs font-medium text-white">{p.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="scrollbar-none flex gap-4 overflow-x-auto pb-1">
          {(categories || []).map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="flex min-w-[110px] flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-4 text-center transition hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-lg font-bold text-brand-700">
                {cat.name.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-slate-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <SectionHeading eyebrow="Handpicked" title="Featured Products" viewAllHref="/shop?featured=1" />
        <ProductGrid products={featured?.data} loading={loadingFeatured} />
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-4 rounded-2xl bg-accent-50 p-6 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <Truck className="text-accent-600" />
              <div>
                <p className="text-sm font-bold text-slate-800">Free Shipping</p>
                <p className="text-xs text-slate-500">On qualifying orders</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-accent-600" />
              <div>
                <p className="text-sm font-bold text-slate-800">Secure Checkout</p>
                <p className="text-xs text-slate-500">Cash on delivery available</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="text-accent-600" />
              <div>
                <p className="text-sm font-bold text-slate-800">Verified Reviews</p>
                <p className="text-xs text-slate-500">From real customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <SectionHeading eyebrow="Popular Right Now" title="Trending Products" viewAllHref="/shop?sort=popularity" />
        <ProductGrid products={trending?.data} loading={loadingTrending} />
      </section>
    </div>
  )
}
