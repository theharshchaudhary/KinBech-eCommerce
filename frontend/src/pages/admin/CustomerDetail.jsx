import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import * as admin from '../../api/admin'
import PageHeader from '../../components/admin/PageHeader'
import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import Price from '../../components/ui/Price'
import PageSpinner from '../../components/ui/PageSpinner'
import { formatDate } from '../../lib/format'

export default function CustomerDetail() {
  const { id } = useParams()
  const { data, isLoading } = useQuery({ queryKey: ['admin-customer', id], queryFn: () => admin.adminGetCustomer(id) })

  if (isLoading) return <PageSpinner />
  if (!data) return null

  const { customer, orders, addresses } = data

  return (
    <div>
      <PageHeader title={customer.name} description={customer.email} />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Order History</h3>
            {orders.length ? (
              <ul className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <p className="font-medium text-slate-800">{o.order_number}</p>
                      <p className="text-xs text-slate-400">{formatDate(o.created_at)}</p>
                    </div>
                    <OrderStatusBadge status={o.status} />
                    <Price amount={o.total} size="sm" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No orders yet</p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-2 text-sm font-bold text-slate-800">Contact Info</h3>
            <p className="text-sm text-slate-600">{customer.phone || 'No phone on file'}</p>
            <p className="text-xs text-slate-400">Joined {formatDate(customer.created_at)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-2 text-sm font-bold text-slate-800">Saved Addresses</h3>
            {addresses?.length ? (
              addresses.map((a) => (
                <p key={a.id} className="mb-2 border-b border-slate-50 pb-2 text-sm text-slate-600 last:border-0">
                  {a.full_name} - {a.line1}, {a.city}, {a.state}
                </p>
              ))
            ) : (
              <p className="text-sm text-slate-400">No addresses saved</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
