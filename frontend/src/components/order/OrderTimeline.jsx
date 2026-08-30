import { Check, X } from 'lucide-react'

const STEPS = ['pending', 'processing', 'shipped', 'delivered']

export default function OrderTimeline({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
        <X size={16} /> This order was cancelled
      </div>
    )
  }

  const currentIndex = STEPS.indexOf(status)

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => (
        <div key={step} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                i <= currentIndex ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {i < currentIndex ? <Check size={15} /> : i + 1}
            </div>
            <span className={`text-xs font-medium capitalize ${i <= currentIndex ? 'text-slate-800' : 'text-slate-400'}`}>{step}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`mx-1 h-0.5 flex-1 ${i < currentIndex ? 'bg-brand-600' : 'bg-slate-100'}`} />}
        </div>
      ))}
    </div>
  )
}
