import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Star, Trash2, Upload, X } from 'lucide-react'
import * as admin from '../../api/admin'
import PageHeader from '../../components/admin/PageHeader'
import FormField, { inputClass } from '../../components/ui/FormField'
import Button from '../../components/ui/Button'
import PageSpinner from '../../components/ui/PageSpinner'

function SpecsBuilder({ specs, setSpecs }) {
  const entries = Object.entries(specs || {})

  const update = (i, key, value) => {
    const next = [...entries]
    next[i] = [key, value]
    setSpecs(Object.fromEntries(next))
  }

  const remove = (i) => setSpecs(Object.fromEntries(entries.filter((_, idx) => idx !== i)))

  return (
    <div className="space-y-2">
      {entries.map(([key, value], i) => (
        <div key={i} className="flex gap-2">
          <input value={key} onChange={(e) => update(i, e.target.value, value)} placeholder="Spec name" className={inputClass} />
          <input value={value} onChange={(e) => update(i, key, e.target.value)} placeholder="Value" className={inputClass} />
          <button type="button" onClick={() => remove(i)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setSpecs({ ...specs, [`Spec ${entries.length + 1}`]: '' })}
        className="flex items-center gap-1 text-sm font-semibold text-brand-600"
      >
        <Plus size={14} /> Add specification
      </button>
    </div>
  )
}

function ImageManager({ productId, images, onRefresh }) {
  const uploadMutation = useMutation({
    mutationFn: (files) => {
      const fd = new FormData()
      files.forEach((f) => fd.append('images[]', f))
      return admin.adminUploadProductImages(productId, fd)
    },
    onSuccess: onRefresh,
    onError: () => toast.error('Could not upload image(s)'),
  })
  const primaryMutation = useMutation({ mutationFn: (imgId) => admin.adminSetPrimaryImage(productId, imgId), onSuccess: onRefresh })
  const deleteMutation = useMutation({ mutationFn: (imgId) => admin.adminDeleteProductImage(productId, imgId), onSuccess: onRefresh })

  return (
    <div>
      <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {(images || []).map((img) => (
          <div key={img.id} className="group relative overflow-hidden rounded-lg border border-slate-200">
            <img src={img.url} alt="" className="aspect-square w-full object-cover" />
            {img.is_primary && <span className="absolute left-1 top-1 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Primary</span>}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
              {!img.is_primary && (
                <button onClick={() => primaryMutation.mutate(img.id)} className="rounded-full bg-white p-1.5 text-slate-700" title="Set as primary">
                  <Star size={13} />
                </button>
              )}
              <button onClick={() => deleteMutation.mutate(img.id)} className="rounded-full bg-white p-1.5 text-red-500" title="Delete">
                <X size={13} />
              </button>
            </div>
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-brand-400 hover:text-brand-500">
          <Upload size={18} />
          <span className="text-[11px]">Upload</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files.length && uploadMutation.mutate(Array.from(e.target.files))}
          />
        </label>
      </div>
      {uploadMutation.isPending && <p className="text-xs text-slate-400">Uploading...</p>}
    </div>
  )
}

function VariantManager({ productId, variants, onRefresh }) {
  const [form, setForm] = useState({ sku: '', attrKey: '', attrValue: '', price_override: '', stock_quantity: 0 })

  const createMutation = useMutation({
    mutationFn: () =>
      admin.adminCreateVariant(productId, {
        sku: form.sku,
        attributes: { [form.attrKey]: form.attrValue },
        price_override: form.price_override || null,
        stock_quantity: Number(form.stock_quantity),
      }),
    onSuccess: () => {
      onRefresh()
      setForm({ sku: '', attrKey: '', attrValue: '', price_override: '', stock_quantity: 0 })
    },
    onError: () => toast.error('Could not add variant'),
  })
  const deleteMutation = useMutation({ mutationFn: (id) => admin.adminDeleteVariant(productId, id), onSuccess: onRefresh })

  return (
    <div>
      <table className="mb-3 w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-400">
            <th className="pb-2">SKU</th>
            <th className="pb-2">Attributes</th>
            <th className="pb-2">Price Override</th>
            <th className="pb-2">Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(variants || []).map((v) => (
            <tr key={v.id} className="border-t border-slate-100">
              <td className="py-2">{v.sku}</td>
              <td className="py-2">{v.label}</td>
              <td className="py-2">{v.price}</td>
              <td className="py-2">{v.stock_quantity}</td>
              <td className="py-2 text-right">
                <button onClick={() => deleteMutation.mutate(v.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-5">
        <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={inputClass} />
        <input placeholder="Attribute (e.g. Color)" value={form.attrKey} onChange={(e) => setForm({ ...form, attrKey: e.target.value })} className={inputClass} />
        <input placeholder="Value (e.g. Red)" value={form.attrValue} onChange={(e) => setForm({ ...form, attrValue: e.target.value })} className={inputClass} />
        <input placeholder="Price override" value={form.price_override} onChange={(e) => setForm({ ...form, price_override: e.target.value })} className={inputClass} />
        <input placeholder="Stock" type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className={inputClass} />
      </div>
      <Button size="sm" className="mt-2" onClick={() => createMutation.mutate()} loading={createMutation.isPending} disabled={!form.sku || !form.attrKey}>
        <Plus size={14} /> Add Variant
      </Button>
    </div>
  )
}

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isNew = id === 'new'
  const [specs, setSpecs] = useState({})

  const { data: categories } = useQuery({ queryKey: ['admin-categories'], queryFn: admin.adminGetCategories })
  const { data: brands } = useQuery({ queryKey: ['admin-brands'], queryFn: admin.adminGetBrands })
  const { data: product, isLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => admin.adminGetProduct(id),
    enabled: !isNew,
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    if (product) {
      reset({
        category_id: product.category?.id,
        brand_id: product.brand?.id || '',
        name: product.name,
        sku: product.sku,
        short_description: product.short_description,
        description: product.description,
        price: product.price,
        discount_price: product.discount_price || '',
        stock_quantity: product.stock_quantity,
        low_stock_threshold: 5,
        is_active: product.is_active,
        is_featured: product.is_featured,
      })
      setSpecs(product.specifications || {})
    }
  }, [product, reset])

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, specifications: specs, brand_id: data.brand_id || null, discount_price: data.discount_price || null }
      return isNew ? admin.adminCreateProduct(payload) : admin.adminUpdateProduct(id, payload)
    },
    onSuccess: (result) => {
      toast.success(isNew ? 'Product created' : 'Product updated')
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      if (isNew) navigate(`/admin/products/${result.id}`, { replace: true })
      else qc.invalidateQueries({ queryKey: ['admin-product', id] })
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Please check the form for errors'),
  })

  const refreshProduct = () => qc.invalidateQueries({ queryKey: ['admin-product', id] })

  if (!isNew && isLoading) return <PageSpinner />

  return (
    <div>
      <PageHeader title={isNew ? 'Add Product' : `Edit: ${product?.name}`} />

      <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-800">Basic Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Product Name" error={errors.name?.message}>
              <input className={inputClass} {...register('name', { required: 'Required' })} />
            </FormField>
            <FormField label="SKU" error={errors.sku?.message}>
              <input className={inputClass} {...register('sku', { required: 'Required' })} />
            </FormField>
            <FormField label="Category" error={errors.category_id?.message}>
              <select className={inputClass} {...register('category_id', { required: 'Required' })}>
                <option value="">Select category</option>
                {(categories || []).map((c) => (
                  <optgroup key={c.id} label={c.name}>
                    <option value={c.id}>{c.name}</option>
                    {c.children?.map((child) => (
                      <option key={child.id} value={child.id}>&nbsp;&nbsp;{child.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </FormField>
            <FormField label="Brand (optional)">
              <select className={inputClass} {...register('brand_id')}>
                <option value="">No brand</option>
                {(brands || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Short Description" className="mt-4">
            <textarea rows={2} className={inputClass} {...register('short_description')} />
          </FormField>
          <FormField label="Full Description" className="mt-4">
            <textarea rows={5} className={inputClass} {...register('description')} />
          </FormField>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-800">Pricing & Inventory</h3>
          <div className="grid gap-4 sm:grid-cols-4">
            <FormField label="Price" error={errors.price?.message}>
              <input type="number" step="0.01" className={inputClass} {...register('price', { required: 'Required', valueAsNumber: true })} />
            </FormField>
            <FormField label="Discount Price">
              <input type="number" step="0.01" className={inputClass} {...register('discount_price', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Stock Quantity" error={errors.stock_quantity?.message}>
              <input type="number" className={inputClass} {...register('stock_quantity', { required: 'Required', valueAsNumber: true })} />
            </FormField>
            <FormField label="Low Stock Alert">
              <input type="number" className={inputClass} {...register('low_stock_threshold', { valueAsNumber: true })} />
            </FormField>
          </div>
          <div className="mt-4 flex gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" {...register('is_active')} className="h-4 w-4 rounded border-slate-300 text-brand-600" /> Active (visible in store)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" {...register('is_featured')} className="h-4 w-4 rounded border-slate-300 text-brand-600" /> Featured
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-800">Specifications</h3>
          <SpecsBuilder specs={specs} setSpecs={setSpecs} />
        </div>

        <Button type="submit" loading={isSubmitting || saveMutation.isPending}>
          {isNew ? 'Create Product' : 'Save Changes'}
        </Button>
      </form>

      {!isNew && product && (
        <>
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Product Images</h3>
            <ImageManager productId={id} images={product.images} onRefresh={refreshProduct} />
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Variants (e.g. size, color)</h3>
            <VariantManager productId={id} variants={product.variants} onRefresh={refreshProduct} />
          </div>
        </>
      )}

      {isNew && (
        <p className="mt-4 text-sm text-slate-400">Save the product first to add images and variants.</p>
      )}
    </div>
  )
}
