import { useCategories, useBrands } from '../../hooks/useCatalog'

export default function ProductFilters({ filters, onChange }) {
  const { data: categories } = useCategories()
  const { data: brands } = useBrands()

  const toggleBrand = (id) => {
    const current = filters.brand ? filters.brand.split(',').filter(Boolean) : []
    const next = current.includes(String(id)) ? current.filter((b) => b !== String(id)) : [...current, String(id)]
    onChange({ brand: next.join(',') || undefined })
  }

  const activeBrands = filters.brand ? filters.brand.split(',') : []

  return (
    <aside className="w-full shrink-0 space-y-6 lg:w-64">
      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-800">Category</h3>
        <ul className="space-y-1.5 text-sm">
          <li>
            <button
              onClick={() => onChange({ category: undefined })}
              className={`w-full rounded-lg px-2 py-1.5 text-left ${!filters.category ? 'bg-brand-50 font-semibold text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              All Categories
            </button>
          </li>
          {(categories || []).map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => onChange({ category: cat.slug })}
                className={`w-full rounded-lg px-2 py-1.5 text-left ${filters.category === cat.slug ? 'bg-brand-50 font-semibold text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {cat.name} <span className="text-xs text-slate-400">({cat.products_count})</span>
              </button>
              {filters.category === cat.slug && cat.children?.length > 0 && (
                <ul className="ml-3 mt-1 space-y-1 border-l border-slate-100 pl-3">
                  {cat.children.map((child) => (
                    <li key={child.id}>
                      <button
                        onClick={() => onChange({ category: child.slug })}
                        className={`w-full rounded-lg px-2 py-1 text-left text-xs ${filters.category === child.slug ? 'font-semibold text-brand-700' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        {child.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-800">Brand</h3>
        <ul className="max-h-52 space-y-2 overflow-y-auto text-sm">
          {(brands || []).map((brand) => (
            <li key={brand.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={activeBrands.includes(String(brand.id))}
                onChange={() => toggleBrand(brand.id)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-slate-600">{brand.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-800">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={filters.min_price || ''}
            onBlur={(e) => onChange({ min_price: e.target.value || undefined })}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
          />
          <span className="text-slate-400">-</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={filters.max_price || ''}
            onBlur={(e) => onChange({ max_price: e.target.value || undefined })}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-800">Rating</h3>
        <div className="space-y-1.5">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => onChange({ min_rating: filters.min_rating === String(r) ? undefined : r })}
              className={`flex w-full items-center gap-1 rounded-lg px-2 py-1 text-left text-sm ${filters.min_rating === String(r) ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {r}★ &amp; up
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={filters.in_stock === '1'}
          onChange={(e) => onChange({ in_stock: e.target.checked ? '1' : undefined })}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        In stock only
      </label>
    </aside>
  )
}
