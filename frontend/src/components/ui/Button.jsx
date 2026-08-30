import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600',
  accent: 'bg-accent-500 text-white hover:bg-accent-600 focus-visible:outline-accent-500',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  'outline-inverse': 'border border-white/40 bg-transparent text-white hover:bg-white/10',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  subtle: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  as: Comp = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}) {
  return (
    <Comp
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </Comp>
  )
}
