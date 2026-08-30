import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import * as admin from '../../api/admin'
import PageHeader from '../../components/admin/PageHeader'
import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import Price from '../../components/ui/Price'
import Pagination from '../../components/ui/Pagination'
import PageSpinner from '../../components/ui/PageSpinner'
import { formatDate } from '../../lib/format'

export default function Orders() {
  const [filters, setFilters] = useState({ q: '', status: '', page: 1 })
  const { data, isLoading } = useQuery({ queryKey: ['admin-orders', filters], queryFn: () => admin.adminGetOrders(filters) })

  if (isLoading && !data) return <PageSpinner />

  return (
    <div>
      <PageHeader title="Orders" description={`${data?.meta?.total ?? 0} orders`} />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))}
            placeholder="Search order # or customer..."
            className="w-64 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
        >
          <option value="">All Status</option>
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((order) => (
              <tr key={order.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/admin/orders/${order.id}`} className="font-medium text-brand-600 hover:underline">{order.order_number}</Link>
                  <p className="text-xs text-slate-400">{formatDate(order.created_at)}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{order.customer?.name}</td>
                <td className="px-4 py-3"><OrderStatusBadge status={order.payment_status} /></td>
                <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                <td className="px-4 py-3 text-right font-semibold"><Price amount={order.total} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination meta={data?.meta} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
    </div>
  )
}
