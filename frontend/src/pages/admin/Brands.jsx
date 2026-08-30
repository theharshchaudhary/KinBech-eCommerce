import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as admin from '../../api/admin'
import PageHeader from '../../components/admin/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import FormField, { inputClass } from '../../components/ui/FormField'
import PageSpinner from '../../components/ui/PageSpinner'

function BrandForm({ brand, onSuccess }) {
  const { register, handleSubmit } = useForm({ defaultValues: brand || { name: '', is_active: true } })
  const [file, setFile] = useState(null)

  const mutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData()
      fd.append('name', data.name)
      fd.append('is_active', data.is_active ? 1 : 0)
      if (file) fd.append('logo', file)
      return brand ? admin.adminUpdateBrand(brand.id, fd) : admin.adminCreateBrand(fd)
    },
    onSuccess: () => {
      toast.success(brand ? 'Brand updated' : 'Brand created')
      onSuccess()
    },
  })

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-3">
      <FormField label="Brand Name">
        <input className={inputClass} {...register('name', { required: true })} />
      </FormField>
      <FormField label="Logo">
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-sm" />
      </FormField>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" {...register('is_active')} className="h-4 w-4 rounded border-slate-300 text-brand-600" /> Active
      </label>
      <Button type="submit" className="w-full" loading={mutation.isPending}>Save</Button>
    </form>
  )
}

export default function Brands() {
  const qc = useQueryClient()
  const { data: brands, isLoading } = useQuery({ queryKey: ['admin-brands'], queryFn: admin.adminGetBrands })
  const [modalBrand, setModalBrand] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const deleteMutation = useMutation({
    mutationFn: admin.adminDeleteBrand,
    onSuccess: () => {
      toast.success('Brand deleted')
      qc.invalidateQueries({ queryKey: ['admin-brands'] })
      setDeleteId(null)
    },
  })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <PageHeader title="Brands" actions={<Button size="sm" onClick={() => { setModalBrand(null); setShowModal(true) }}><Plus size={15} /> Add Brand</Button>} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brands?.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              {b.logo && <img src={b.logo} alt="" className="h-9 w-9 rounded-lg object-cover" />}
              <div>
                <p className="font-semibold text-slate-800">{b.name}</p>
                <Badge tone={b.is_active ? 'green' : 'slate'}>{b.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
            </div>
            <div className="flex gap-3 text-slate-400">
              <button onClick={() => { setModalBrand(b); setShowModal(true) }} className="hover:text-brand-600"><Pencil size={15} /></button>
              <button onClick={() => setDeleteId(b.id)} className="hover:text-red-500"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={modalBrand ? 'Edit Brand' : 'Add Brand'}>
        <BrandForm
          brand={modalBrand}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ['admin-brands'] })
            setShowModal(false)
          }}
        />
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} title="Delete this brand?" />
    </div>
  )
}
