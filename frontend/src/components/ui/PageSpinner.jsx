export default function PageSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
