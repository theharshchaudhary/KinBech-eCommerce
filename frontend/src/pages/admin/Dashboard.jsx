import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AlertTriangle, DollarSign, MessageSquare, Package, ShoppingCart, Star, Users } from 'lucide-react'
import * as admin from '../../api/admin'
import PageHeader from '../../components/admin/PageHeader'
import StatCard from '../../components/admin/StatCard'
import RevenueChart from '../../components/admin/RevenueChart'
import TopProductsChart from '../../components/admin/TopProductsChart'
import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import Price from '../../components/ui/Price'
import PageSpinner from '../../components/ui/PageSpinner'
import { formatDate } from '../../lib/format'

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: admin.getDashboard })

  if (isLoading) return <PageSpinner />

  const { stats, revenue_series, top_products, recent_orders, low_stock_products, status_breakdown } = data

  return (
    <div>
      <PageHeader title="Dashboard" description="Store performance at a glance" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={<Price amount={stats.total_revenue} size="sm" />} tone="green" />
        <StatCard icon={ShoppingCart} label="Total Orders" value={stats.orders_count} tone="brand" />
        <StatCard icon={Users} label="Customers" value={stats.customers_count} tone="accent" />
        <StatCard icon={Package} label="Products" value={stats.products_count} tone="brand" />
        <StatCard icon={AlertTriangle} label="Low Stock Items" value={stats.low_stock_count} tone="amber" />
        <StatCard icon={AlertTriangle} label="Out of Stock" value={stats.out_of_stock_count} tone="red" />
        <StatCard icon={MessageSquare} label="Unread Messages" value={stats.unread_messages} tone="brand" />
        <StatCard icon={Star} label="Pending Reviews" value={stats.pending_reviews} tone="amber" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <RevenueChart data={revenue_series} />
        <TopProductsChart data={top_products} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs font-semibold text-brand-600">View all</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="pb-2">Order</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recent_orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-50">
                  <td className="py-2">
                    <Link to={`/admin/orders/${o.id}`} className="font-medium text-brand-600 hover:underline">{o.order_number}</Link>
                    <p className="text-xs text-slate-400">{formatDate(o.created_at)}</p>
                  </td>
                  <td className="py-2 text-slate-600">{o.customer}</td>
                  <td className="py-2"><OrderStatusBadge status={o.status} /></td>
                  <td className="py-2 text-right font-semibold text-slate-800"><Price amount={o.total} size="sm" /></td>
                </tr>
              ))}
              {!recent_orders.length && (
                <tr><td colSpan={4} className="py-6 text-center text-slate-400">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Orders by Status</h3>
            <ul className="space-y-2">
              {Object.entries(status_breakdown).length ? (
                Object.entries(status_breakdown).map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between text-sm">
                    <OrderStatusBadge status={status} />
                    <span className="font-semibold text-slate-700">{count}</span>
                  </li>
                ))
              ) : (
                <p className="text-sm text-slate-400">No orders yet</p>
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <AlertTriangle size={15} className="text-amber-500" /> Low Stock Alerts
            </h3>
            <ul className="space-y-2 text-sm">
              {low_stock_products.length ? (
                low_stock_products.map((p) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <span className="line-clamp-1 text-slate-600">{p.name}</span>
                    <span className="font-semibold text-amber-600">{p.stock_quantity} left</span>
                  </li>
                ))
              ) : (
                <p className="text-slate-400">All products well stocked</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
