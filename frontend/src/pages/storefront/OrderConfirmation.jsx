import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import * as account from '../../api/account'
import PageSpinner from '../../components/ui/PageSpinner'
import Price from '../../components/ui/Price'
import Button from '../../components/ui/Button'

export default function OrderConfirmation() {
  const { id } = useParams()
  const { data: order, isLoading } = useQuery({ queryKey: ['order', id], queryFn: () => account.getOrder(id) })

  if (isLoading) return <PageSpinner />
  if (!order) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
        <CheckCircle2 size={36} />
      </div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Order Placed Successfully!</h1>
      <p className="mt-2 text-slate-500">Thank you for shopping with KinBech. A confirmation email is on its way.</p>

      <div className="mx-auto mt-8 max-w-md rounded-xl border border-slate-200 bg-white p-6 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Order Number</span>
          <span className="font-semibold text-slate-800">{order.order_number}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-slate-500">Payment Method</span>
          <span className="font-semibold text-slate-800 uppercase">{order.payment_method.replace('_', ' ')}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-slate-500">Total</span>
          <Price amount={order.total} size="sm" />
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Button as={Link} to="/account/orders" variant="outline">
          View My Orders
        </Button>
        <Button as={Link} to="/shop">
          Continue Shopping
        </Button>
      </div>
    </div>
  )
}
