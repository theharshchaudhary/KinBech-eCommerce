import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import * as admin from '../../api/admin'
import PageHeader from '../../components/admin/PageHeader'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'
import PageSpinner from '../../components/ui/PageSpinner'
import useAuthStore from '../../store/authStore'
import { formatDate } from '../../lib/format'

export default function Customers() {
  const { can } = useAuthStore()
  const qc = useQueryClient()
  const [filters, setFilters] = useState({ q: '', page: 1 })
  const { data, isLoading } = useQuery({ queryKey: ['admin-customers', filters], queryFn: () => admin.adminGetCustomers(filters) })

  const toggleMutation = useMutation({
    mutationFn: admin.adminToggleCustomerActive,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-customers'] }),
  })

  if (isLoading && !data) return <PageSpinner />

  return (
    <div>
      <PageHeader title="Customers" description={`${data?.meta?.total ?? 0} registered customers`} />

      <div className="relative mb-4 w-64">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))}
          placeholder="Search customers..."
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
              {can('customers.manage') && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data?.data.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3">
                  <Link to={`/admin/customers/${c.id}`} className="font-medium text-brand-600 hover:underline">{c.name}</Link>
                </td>
                <td className="px-4 py-3 text-slate-500">{c.email}</td>
                <td className="px-4 py-3 text-slate-500">{c.orders_count}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(c.created_at)}</td>
                <td className="px-4 py-3"><Badge tone={c.is_active ? 'green' : 'red'}>{c.is_active ? 'Active' : 'Blocked'}</Badge></td>
                {can('customers.manage') && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleMutation.mutate(c.id)} className="text-xs font-semibold text-brand-600 hover:underline">
                      {c.is_active ? 'Block' : 'Unblock'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination meta={data?.meta} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
    </div>
  )
}
