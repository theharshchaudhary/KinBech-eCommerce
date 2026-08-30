export default function FormField({ label, error, children, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>}
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
}

export const inputClass =
  'w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'
