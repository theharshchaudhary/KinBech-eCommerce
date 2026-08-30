import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Check, Trash2 } from 'lucide-react'
import * as admin from '../../api/admin'
import PageHeader from '../../components/admin/PageHeader'
import StarRating from '../../components/ui/StarRating'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'
import PageSpinner from '../../components/ui/PageSpinner'
import { formatDate } from '../../lib/format'

export default function Reviews() {
  const qc = useQueryClient()
  const [filters, setFilters] = useState({ status: '', page: 1 })
  const { data, isLoading } = useQuery({ queryKey: ['admin-reviews', filters], queryFn: () => admin.adminGetReviews(filters) })

  const approve = useMutation({
    mutationFn: admin.adminApproveReview,
    onSuccess: () => {
      toast.success('Review approved')
      qc.invalidateQueries({ queryKey: ['admin-reviews'] })
    },
  })
  const remove = useMutation({
    mutationFn: admin.adminDeleteReview,
    onSuccess: () => {
      toast.success('Review removed')
      qc.invalidateQueries({ queryKey: ['admin-reviews'] })
    },
  })

  if (isLoading && !data) return <PageSpinner />

  return (
    <div>
      <PageHeader title="Reviews" description="Moderate customer product reviews" />

      <div className="mb-4 flex gap-2">
        {[{ v: '', l: 'All' }, { v: 'pending', l: 'Pending' }, { v: 'approved', l: 'Approved' }].map((opt) => (
          <button
            key={opt.v}
            onClick={() => setFilters({ status: opt.v, page: 1 })}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filters.status === opt.v ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            {opt.l}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {data?.data.map((r) => (
          <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{r.customer_name}</span>
                  <span className="text-xs text-slate-400">on {r.product_name}</span>
                  <Badge tone={r.is_approved ? 'green' : 'amber'}>{r.is_approved ? 'Approved' : 'Pending'}</Badge>
                </div>
                <StarRating rating={r.rating} showCount={false} size={13} />
                {r.title && <p className="mt-1 text-sm font-semibold text-slate-700">{r.title}</p>}
                <p className="text-sm text-slate-600">{r.comment}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDate(r.created_at)}</p>
              </div>
              <div className="flex gap-2">
                {!r.is_approved && (
                  <button onClick={() => approve.mutate(r.id)} className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100"><Check size={15} /></button>
                )}
                <button onClick={() => remove.mutate(r.id)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100"><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
        {!data?.data.length && <p className="py-10 text-center text-sm text-slate-400">No reviews found</p>}
      </div>

      <Pagination meta={data?.meta} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
    </div>
  )
}
