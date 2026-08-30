import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const BLUE = '#2a78d6'

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[#e1e0d9] bg-[#fcfcfb] px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-[#52514e]">{payload[0].payload.name}</p>
      <p className="font-bold text-[#0b0b0b]">{payload[0].value} sold</p>
    </div>
  )
}

export default function TopProductsChart({ data }) {
  const chartData = (data || []).map((p) => ({ name: p.name, sold: p.sold_count }))

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-bold text-slate-800">Top Selling Products</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid stroke="#e1e0d9" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#898781' }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fontSize: 11, fill: '#52514e' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v.length > 18 ? `${v.slice(0, 18)}…` : v)}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(42,120,214,0.06)' }} />
          <Bar dataKey="sold" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={BLUE} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
