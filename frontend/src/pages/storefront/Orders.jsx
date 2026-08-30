import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PackageSearch } from 'lucide-react'
import * as account from '../../api/account'
import PageSpinner from '../../components/ui/PageSpinner'
import EmptyState from '../../components/ui/EmptyState'
import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import Price from '../../components/ui/Price'
import Pagination from '../../components/ui/Pagination'
import Button from '../../components/ui/Button'
import { formatDate } from '../../lib/format'
import { useState } from 'react'

export default function Orders() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({ queryKey: ['orders', page], queryFn: () => account.getOrders(page) })

  if (isLoading) return <PageSpinner />

  if (!data?.data?.length) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No orders yet"
        description="Once you place an order, it'll show up here."
        action={
          <Button as={Link} to="/shop" className="mt-2">
            Start Shopping
          </Button>
        }
      />
    )
  }

  return (
    <div>
      <div className="space-y-4">
        {data.data.map((order) => (
          <Link
            key={order.id}
            to={`/account/orders/${order.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-800">{order.order_number}</p>
                <p className="text-xs text-slate-400">{formatDate(order.created_at)} • {order.items.length} item(s)</p>
              </div>
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.status} />
                <Price amount={order.total} size="sm" />
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Pagination meta={data.meta} onPageChange={setPage} />
    </div>
  )
}
