import { useState } from 'react'
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
import { useForm } from 'react-hook-form'

function CategoryForm({ category, categories, onSuccess }) {
  const { register, handleSubmit } = useForm({
    defaultValues: category || { name: '', parent_id: '', is_active: true, sort_order: 0 },
  })
  const [file, setFile] = useState(null)

  const mutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => v !== '' && v !== undefined && fd.append(k, k === 'is_active' ? (v ? 1 : 0) : v))
      if (file) fd.append('image', file)
      return category ? admin.adminUpdateCategory(category.id, fd) : admin.adminCreateCategory(fd)
    },
    onSuccess: () => {
      toast.success(category ? 'Category updated' : 'Category created')
      onSuccess()
    },
    onError: () => toast.error('Please check the form and try again'),
  })

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-3">
      <FormField label="Name">
        <input className={inputClass} {...register('name', { required: true })} />
      </FormField>
      <FormField label="Parent Category (optional)">
        <select className={inputClass} {...register('parent_id')}>
          <option value="">None (top-level)</option>
          {categories?.filter((c) => c.id !== category?.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </FormField>
      <FormField label="Description">
        <textarea rows={2} className={inputClass} {...register('description')} />
      </FormField>
      <FormField label="Image">
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-sm" />
      </FormField>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" {...register('is_active')} className="h-4 w-4 rounded border-slate-300 text-brand-600" /> Active
      </label>
      <Button type="submit" className="w-full" loading={mutation.isPending}>Save</Button>
    </form>
  )
}

export default function Categories() {
  const qc = useQueryClient()
  const { data: categories, isLoading } = useQuery({ queryKey: ['admin-categories'], queryFn: admin.adminGetCategories })
  const [modalCategory, setModalCategory] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const deleteMutation = useMutation({
    mutationFn: admin.adminDeleteCategory,
    onSuccess: () => {
      toast.success('Category deleted')
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      setDeleteId(null)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Could not delete category'),
  })

  if (isLoading) return <PageSpinner />

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin-categories'] })
    setShowModal(false)
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        actions={
          <Button size="sm" onClick={() => { setModalCategory(null); setShowModal(true) }}>
            <Plus size={15} /> Add Category
          </Button>
        }
      />

      <div className="space-y-3">
        {categories?.map((cat) => (
          <div key={cat.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {cat.image && <img src={cat.image} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                <div>
                  <p className="font-semibold text-slate-800">{cat.name}</p>
                  <p className="text-xs text-slate-400">{cat.products_count} products</p>
                </div>
                <Badge tone={cat.is_active ? 'green' : 'slate'}>{cat.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
              <div className="flex gap-3 text-slate-400">
                <button onClick={() => { setModalCategory(cat); setShowModal(true) }} className="hover:text-brand-600"><Pencil size={16} /></button>
                <button onClick={() => setDeleteId(cat.id)} className="hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
            {cat.children?.length > 0 && (
              <div className="ml-6 mt-3 space-y-2 border-l border-slate-100 pl-4">
                {cat.children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">{child.name}</span>
                      <Badge tone={child.is_active ? 'green' : 'slate'}>{child.is_active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="flex gap-3 text-slate-400">
                      <button onClick={() => { setModalCategory(child); setShowModal(true) }} className="hover:text-brand-600"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(child.id)} className="hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={modalCategory ? 'Edit Category' : 'Add Category'}>
        <CategoryForm category={modalCategory} categories={categories} onSuccess={refresh} />
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Delete this category?"
      />
    </div>
  )
}
