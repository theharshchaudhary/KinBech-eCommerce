import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as admin from '../../api/admin'
import PageHeader from '../../components/admin/PageHeader'
import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import OrderTimeline from '../../components/order/OrderTimeline'
import Price from '../../components/ui/Price'
import Button from '../../components/ui/Button'
import PageSpinner from '../../components/ui/PageSpinner'
import { inputClass } from '../../components/ui/FormField'
import { formatDateTime } from '../../lib/format'
import useAuthStore from '../../store/authStore'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrderDetail() {
  const { id } = useParams()
  const qc = useQueryClient()
  const { can } = useAuthStore()
  const { data: order, isLoading } = useQuery({ queryKey: ['admin-order', id], queryFn: () => admin.adminGetOrder(id) })
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')

  const updateStatus = useMutation({
    mutationFn: () => admin.adminUpdateOrderStatus(id, { status, note }),
    onSuccess: () => {
      toast.success('Order status updated - customer notified by email')
      qc.invalidateQueries({ queryKey: ['admin-order', id] })
      setNote('')
    },
  })

  if (isLoading) return <PageSpinner />
  if (!order) return null

  return (
    <div>
      <PageHeader title={order.order_number} description={`Placed ${formatDateTime(order.created_at)}`} actions={<OrderStatusBadge status={order.status} />} />

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-6">
        <OrderTimeline status={order.status} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Items</h3>
            <ul className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <img src={item.image} alt="" className="h-12 w-12 rounded-lg border border-slate-100 object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{item.product_name}</p>
                    {item.variant_label && <p className="text-xs text-slate-400">{item.variant_label}</p>}
                    <p className="text-xs text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <Price amount={item.line_total} size="sm" />
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Customer & Shipping</h3>
            <p className="text-sm text-slate-600">{order.customer?.name} • {order.customer?.email} • {order.customer?.phone}</p>
            <p className="mt-2 text-sm text-slate-600">
              {order.shipping_address.line1}, {order.shipping_address.line2 ? `${order.shipping_address.line2}, ` : ''}
              {order.shipping_address.city}, {order.shipping_address.state}, {order.shipping_address.country}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Status History</h3>
            <ul className="space-y-2 text-sm">
              {order.status_history?.map((h, i) => (
                <li key={i} className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <span className="capitalize text-slate-700">{h.status}{h.note ? ` — ${h.note}` : ''}</span>
                  <span className="text-xs text-slate-400">{formatDateTime(h.at)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Payment Summary</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><Price amount={order.subtotal} size="sm" /></div>
              <div className="flex justify-between text-slate-600"><span>Discount</span><span>-<Price amount={order.discount_amount} size="sm" /></span></div>
              <div className="flex justify-between text-slate-600"><span>Shipping</span><Price amount={order.shipping_fee} size="sm" /></div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900"><span>Total</span><Price amount={order.total} size="sm" /></div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
              <span className="font-medium uppercase text-slate-500">{order.payment_method.replace('_', ' ')}</span>
              <OrderStatusBadge status={order.payment_status} />
            </div>
          </div>

          {can('orders.manage') && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Update Status</h3>
              <select value={status || order.status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} mb-2 capitalize`}>
                {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
              <textarea placeholder="Optional note for the customer" value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={`${inputClass} mb-2`} />
              <Button className="w-full" onClick={() => updateStatus.mutate()} loading={updateStatus.isPending}>
                Update & Notify Customer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
