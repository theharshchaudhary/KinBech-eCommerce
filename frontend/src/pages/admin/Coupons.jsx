import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import * as admin from '../../api/admin'
import PageHeader from '../../components/admin/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FormField, { inputClass } from '../../components/ui/FormField'
import PageSpinner from '../../components/ui/PageSpinner'
import Price from '../../components/ui/Price'
import { formatDate } from '../../lib/format'

function CouponForm({ coupon, onSuccess }) {
  const { register, handleSubmit } = useForm({
    defaultValues: coupon || { code: '', type: 'percentage', value: 10, min_order_amount: 0, is_active: true },
  })

  const mutation = useMutation({
    mutationFn: (data) => (coupon ? admin.adminUpdateCoupon(coupon.id, data) : admin.adminCreateCoupon(data)),
    onSuccess: () => {
      toast.success(coupon ? 'Coupon updated' : 'Coupon created')
      onSuccess()
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Please check the form'),
  })

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-3">
      <FormField label="Coupon Code">
        <input className={`${inputClass} uppercase`} {...register('code', { required: true })} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Type">
          <select className={inputClass} {...register('type')}>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </FormField>
        <FormField label="Value">
          <input type="number" step="0.01" className={inputClass} {...register('value', { valueAsNumber: true })} />
        </FormField>
        <FormField label="Min Order Amount">
          <input type="number" step="0.01" className={inputClass} {...register('min_order_amount', { valueAsNumber: true })} />
        </FormField>
        <FormField label="Max Discount (optional)">
          <input type="number" step="0.01" className={inputClass} {...register('max_discount_amount', { valueAsNumber: true })} />
        </FormField>
        <FormField label="Usage Limit (optional)">
          <input type="number" className={inputClass} {...register('usage_limit', { valueAsNumber: true })} />
        </FormField>
        <FormField label="Expires At (optional)">
          <input type="date" className={inputClass} {...register('expires_at')} />
        </FormField>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" {...register('is_active')} className="h-4 w-4 rounded border-slate-300 text-brand-600" /> Active
      </label>
      <Button type="submit" className="w-full" loading={mutation.isPending}>Save Coupon</Button>
    </form>
  )
}

export default function Coupons() {
  const qc = useQueryClient()
  const { data: coupons, isLoading } = useQuery({ queryKey: ['admin-coupons'], queryFn: admin.adminGetCoupons })
  const [modalCoupon, setModalCoupon] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const deleteMutation = useMutation({
    mutationFn: admin.adminDeleteCoupon,
    onSuccess: () => {
      toast.success('Coupon deleted')
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
      setDeleteId(null)
    },
  })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <PageHeader title="Coupons" actions={<Button size="sm" onClick={() => { setModalCoupon(null); setShowModal(true) }}><Plus size={15} /> New Coupon</Button>} />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Min Order</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons?.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-mono font-semibold text-slate-800">{c.code}</td>
                <td className="px-4 py-3 text-slate-600">{c.type === 'percentage' ? `${c.value}%` : <Price amount={c.value} size="sm" />}</td>
                <td className="px-4 py-3 text-slate-500"><Price amount={c.min_order_amount} size="sm" /></td>
                <td className="px-4 py-3 text-slate-500">{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</td>
                <td className="px-4 py-3 text-slate-500">{c.expires_at ? formatDate(c.expires_at) : '—'}</td>
                <td className="px-4 py-3"><Badge tone={c.is_active ? 'green' : 'slate'}>{c.is_active ? 'Active' : 'Inactive'}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3 text-slate-400">
                    <button onClick={() => { setModalCoupon(c); setShowModal(true) }} className="hover:text-brand-600"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteId(c.id)} className="hover:text-red-500"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={modalCoupon ? 'Edit Coupon' : 'New Coupon'}>
        <CouponForm
          coupon={modalCoupon}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['admin-coupons'] })
            setShowModal(false)
          }}
        />
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} title="Delete this coupon?" />
    </div>
  )
}
