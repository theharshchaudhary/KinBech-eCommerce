import ProductCard from './ProductCard'
import EmptyState from '../ui/EmptyState'
import { PackageSearch } from 'lucide-react'

function Skeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="aspect-square bg-slate-100" />
      <div className="space-y-2 p-3">
        <div className="h-2.5 w-1/3 rounded bg-slate-100" />
        <div className="h-3.5 w-full rounded bg-slate-100" />
        <div className="h-3.5 w-1/2 rounded bg-slate-100" />
      </div>
    </div>
  )
}

export default function ProductGrid({ products, loading, columns = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' }) {
  if (loading) {
    return (
      <div className={`grid gap-4 ${columns}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    )
  }

  if (!products?.length) {
    return <EmptyState icon={PackageSearch} title="No products found" description="Try adjusting your filters or search terms." />
  }

  return (
    <div className={`grid gap-4 ${columns}`}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
