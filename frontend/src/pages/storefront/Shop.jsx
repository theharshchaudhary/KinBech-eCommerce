import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import ProductFilters from '../../components/product/ProductFilters'
import ProductGrid from '../../components/product/ProductGrid'
import Pagination from '../../components/ui/Pagination'
import { useProducts } from '../../hooks/useCatalog'

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const filters = Object.fromEntries(searchParams.entries())

  const handleChange = (patch) => {
    const next = { ...filters, ...patch, page: undefined }
    Object.keys(next).forEach((k) => (next[k] === undefined || next[k] === '') && delete next[k])
    setSearchParams(next)
  }

  const apiParams = { ...filters }
  if (apiParams.brand) apiParams.brand = apiParams.brand.split(',').filter(Boolean)

  const { data, isLoading } = useProducts(apiParams)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            {filters.q ? `Results for "${filters.q}"` : filters.category ? 'Shop' : 'All Products'}
          </h1>
          <p className="text-sm text-slate-500">{data?.meta?.total ?? 0} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters((s) => !s)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 lg:hidden">
            <SlidersHorizontal size={15} /> Filters
          </button>
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => handleChange({ sort: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          <ProductFilters filters={filters} onChange={handleChange} />
        </div>
        <div className="flex-1">
          <ProductGrid products={data?.data} loading={isLoading} />
          <Pagination meta={data?.meta} onPageChange={(page) => handleChange({ page })} />
        </div>
      </div>
    </div>
  )
}
