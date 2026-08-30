import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useState } from 'react'
import * as account from '../../api/account'
import PageSpinner from '../../components/ui/PageSpinner'
import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import OrderTimeline from '../../components/order/OrderTimeline'
import Price from '../../components/ui/Price'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { formatMoney, formatDateTime } from '../../lib/format'
import { usePublicSettings } from '../../hooks/useCatalog'

export default function OrderDetail() {
  const { id } = useParams()
  const qc = useQueryClient()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const { data: order, isLoading } = useQuery({ queryKey: ['order', id], queryFn: () => account.getOrder(id) })
  const { data: settings } = usePublicSettings()
  const symbol = settings?.general?.currency_symbol || 'Rs.'

  const cancelOrder = useMutation({
    mutationFn: () => account.cancelOrder(id),
    onSuccess: () => {
      toast.success('Order cancelled')
      qc.invalidateQueries({ queryKey: ['order', id] })
      setConfirmCancel(false)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Could not cancel order'),
  })

  if (isLoading) return <PageSpinner />
  if (!order) return null

  const canCancel = ['pending', 'processing'].includes(order.status)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">{order.order_number}</h1>
          <p className="text-sm text-slate-400">Placed on {formatDateTime(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <OrderTimeline status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-bold text-slate-800">Items</h2>
            <ul className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <img src={item.image} alt="" className="h-14 w-14 rounded-lg border border-slate-100 object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{item.product_name}</p>
                    {item.variant_label && <p className="text-xs text-slate-400">{item.variant_label}</p>}
                    <p className="text-xs text-slate-500">Qty {item.quantity} × {formatMoney(item.unit_price, symbol)}</p>
                  </div>
                  <Price amount={item.line_total} size="sm" />
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-bold text-slate-800">Delivery Address</h2>
            <p className="text-sm text-slate-600">
              {order.shipping_address.full_name} • {order.shipping_address.phone}
              <br />
              {order.shipping_address.line1}, {order.shipping_address.line2 ? `${order.shipping_address.line2}, ` : ''}
              {order.shipping_address.city}, {order.shipping_address.state}, {order.shipping_address.country}
            </p>
          </div>
        </div>

        <div className="h-fit space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-800">Payment Summary</h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatMoney(order.subtotal, symbol)}</span></div>
            {order.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatMoney(order.discount_amount, symbol)}</span></div>}
            <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{order.shipping_fee === 0 ? 'Free' : formatMoney(order.shipping_fee, symbol)}</span></div>
            {order.tax_amount > 0 && <div className="flex justify-between text-slate-600"><span>Tax</span><span>{formatMoney(order.tax_amount, symbol)}</span></div>}
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
              <span>Total</span>
              <Price amount={order.total} size="sm" />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
            <span className="font-medium uppercase text-slate-500">{order.payment_method.replace('_', ' ')}</span>
            <OrderStatusBadge status={order.payment_status} />
          </div>
          {canCancel && (
            <Button variant="danger" className="w-full" onClick={() => setConfirmCancel(true)}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => cancelOrder.mutate()}
        loading={cancelOrder.isPending}
        title="Cancel this order?"
        description="This action cannot be undone. Any reserved stock will be released."
        confirmLabel="Yes, Cancel Order"
      />
    </div>
  )
}
