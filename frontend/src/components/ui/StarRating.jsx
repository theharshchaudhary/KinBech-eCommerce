import { Star, StarHalf } from 'lucide-react'

export default function StarRating({ rating = 0, count, size = 14, showCount = true, interactive = false, onChange }) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex items-center text-amber-400">
        {stars.map((n) => {
          const filled = rating >= n
          const half = !filled && rating >= n - 0.5
          const Icon = half ? StarHalf : Star
          return (
            <button
              key={n}
              type="button"
              disabled={!interactive}
              onClick={() => onChange?.(n)}
              className={interactive ? 'cursor-pointer' : 'cursor-default'}
            >
              <Icon size={size} fill={filled || half ? 'currentColor' : 'none'} strokeWidth={1.5} />
            </button>
          )
        })}
      </span>
      {showCount && count !== undefined && <span className="text-xs text-slate-500">({count})</span>}
    </span>
  )
}
