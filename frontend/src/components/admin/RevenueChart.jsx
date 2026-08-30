import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { usePublicSettings } from '../../hooks/useCatalog'
import { formatMoney, formatDate } from '../../lib/format'

const BLUE = '#2a78d6'

function ChartTooltip({ active, payload, label, symbol }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[#e1e0d9] bg-[#fcfcfb] px-3 py-2 text-xs shadow-md">
      <p className="mb-0.5 font-medium text-[#52514e]">{formatDate(label)}</p>
      <p className="font-bold text-[#0b0b0b]">{formatMoney(payload[0].value, symbol)}</p>
    </div>
  )
}

export default function RevenueChart({ data }) {
  const { data: settings } = usePublicSettings()
  const symbol = settings?.general?.currency_symbol || 'Rs.'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-bold text-slate-800">Revenue - Last 14 Days</h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ left: -20, right: 10 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BLUE} stopOpacity={0.25} />
              <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e1e0d9" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatDate(d).replace(/, \d{4}/, '')}
            tick={{ fontSize: 11, fill: '#898781' }}
            axisLine={{ stroke: '#c3c2b7' }}
            tickLine={false}
            interval={2}
          />
          <YAxis tick={{ fontSize: 11, fill: '#898781' }} axisLine={false} tickLine={false} width={50} />
          <Tooltip content={<ChartTooltip symbol={symbol} />} />
          <Area type="monotone" dataKey="revenue" stroke={BLUE} strokeWidth={2} fill="url(#revenueFill)" activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
