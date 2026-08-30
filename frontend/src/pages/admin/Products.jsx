import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import * as admin from '../../api/admin'
import PageHeader from '../../components/admin/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Price from '../../components/ui/Price'
import Pagination from '../../components/ui/Pagination'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import PageSpinner from '../../components/ui/PageSpinner'
import useAuthStore from '../../store/authStore'

export default function AdminProducts() {
  const { can } = useAuthStore()
  const qc = useQueryClient()
  const [filters, setFilters] = useState({ q: '', status: '', page: 1 })
  const [deleteId, setDeleteId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', filters],
    queryFn: () => admin.adminGetProducts(filters),
  })

  const deleteMutation = useMutation({
    mutationFn: admin.adminDeleteProduct,
    onSuccess: () => {
      toast.success('Product deleted')
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      setDeleteId(null)
    },
  })

  if (isLoading && !data) return <PageSpinner />

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${data?.meta?.total ?? 0} products`}
        actions={
          can('products.manage') && (
            <Button as={Link} to="/admin/products/new" size="sm">
              <Plus size={15} /> Add Product
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))}
            placeholder="Search products..."
            className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0">
                <td className="flex items-center gap-3 px-4 py-3">
                  <img src={p.image} alt="" className="h-10 w-10 rounded-lg border border-slate-100 object-cover" />
                  <span className="line-clamp-1 max-w-[220px] font-medium text-slate-800">{p.name}</span>
                </td>
                <td className="px-4 py-3 text-slate-500">{p.category?.name}</td>
                <td className="px-4 py-3"><Price amount={p.final_price} size="sm" /></td>
                <td className="px-4 py-3">
                  <span className={!p.in_stock ? 'font-semibold text-red-500' : p.is_low_stock ? 'font-semibold text-amber-500' : 'text-slate-600'}>
                    {p.stock_quantity} {p.is_low_stock && p.in_stock && '(low)'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={p.is_active ? 'green' : 'slate'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    {can('products.manage') && (
                      <>
                        <Link to={`/admin/products/${p.id}`} className="text-slate-400 hover:text-brand-600">
                          <Pencil size={16} />
                        </Link>
                        <button onClick={() => setDeleteId(p.id)} className="text-slate-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination meta={data?.meta} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Delete this product?"
        description="This will permanently remove the product from your catalog."
      />
    </div>
  )
}
