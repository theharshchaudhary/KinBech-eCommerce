import { usePublicSettings } from '../../hooks/useCatalog'
import { formatMoney } from '../../lib/format'

export default function Price({ amount, original, size = 'md', className = '' }) {
  const { data } = usePublicSettings()
  const symbol = data?.general?.currency_symbol || 'Rs.'
  const sizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className={`font-bold text-slate-900 ${sizes[size]}`}>{formatMoney(amount, symbol)}</span>
      {original && Number(original) > Number(amount) && (
        <span className="text-sm text-slate-400 line-through">{formatMoney(original, symbol)}</span>
      )}
    </span>
  )
}
