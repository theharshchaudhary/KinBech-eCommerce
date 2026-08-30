import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null

  const pages = Array.from({ length: meta.last_page }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === meta.last_page || Math.abs(p - meta.current_page) <= 1,
  )

  return (
    <div className="flex items-center justify-center gap-1 py-6">
      <button
        onClick={() => onPageChange(meta.current_page - 1)}
        disabled={meta.current_page <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-slate-400">...</span>}
          <button
            onClick={() => onPageChange(p)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
              p === meta.current_page ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        </span>
      ))}

      <button
        onClick={() => onPageChange(meta.current_page + 1)}
        disabled={meta.current_page >= meta.last_page}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
