import { useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Heart, Minus, Plus, ShieldCheck, ShoppingCart, Truck, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useProduct, useRelatedProducts } from '../../hooks/useCatalog'
import { useAddToCart, useToggleWishlist, useWishlistQuery } from '../../hooks/useCart'
import * as catalog from '../../api/catalog'
import useAuthStore from '../../store/authStore'
import PageSpinner from '../../components/ui/PageSpinner'
import Price from '../../components/ui/Price'
import StarRating from '../../components/ui/StarRating'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ProductGrid from '../../components/product/ProductGrid'
import { formatDate } from '../../lib/format'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data: product, isLoading } = useProduct(slug)
  const { data: related } = useRelatedProducts(slug)
  const { user } = useAuthStore()
  const addToCart = useAddToCart()
  const toggleWishlist = useToggleWishlist()
  const { data: wishlist } = useWishlistQuery()
  const qc = useQueryClient()

  const [activeImage, setActiveImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('description')
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })

  const submitReview = useMutation({
    mutationFn: catalog.submitReview,
    onSuccess: () => {
      toast.success('Thanks! Your review will appear once approved.')
      setReviewForm({ rating: 5, title: '', comment: '' })
      qc.invalidateQueries({ queryKey: ['product', slug] })
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Could not submit review'),
  })

  const stock = selectedVariant ? selectedVariant.stock_quantity : product?.stock_quantity
  const price = selectedVariant ? selectedVariant.price : product?.final_price
  const isWishlisted = wishlist?.some((w) => w.product.id === product?.id)

  const groupedAttrs = useMemo(() => {
    if (!product?.variants?.length) return {}
    const groups = {}
    product.variants.forEach((v) => {
      Object.entries(v.attributes || {}).forEach(([key, val]) => {
        groups[key] = groups[key] || new Set()
        groups[key].add(val)
      })
    })
    return Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, [...v]]))
  }, [product])

  if (isLoading) return <PageSpinner />
  if (!product) return null

  const images = product.images?.length ? product.images : [{ url: null, id: 'placeholder' }]

  const handleAddToCart = (buyNow) => {
    if (!user) return navigate('/login')
    addToCart.mutate(
      { product_id: product.id, product_variant_id: selectedVariant?.id, quantity: qty },
      { onSuccess: () => buyNow && navigate('/cart') },
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-5 text-xs text-slate-500">
        <Link to="/" className="hover:text-brand-600">Home</Link> /{' '}
        <Link to={`/shop?category=${product.category?.slug}`} className="hover:text-brand-600">{product.category?.name}</Link> /{' '}
        <span className="text-slate-700">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {images[activeImage]?.url ? (
              <img src={images[activeImage].url} alt={product.name} className="h-full w-full object-contain p-6" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-300">No image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${activeImage === i ? 'border-brand-500' : 'border-slate-200'}`}
                >
                  {img.url && <img src={img.url} alt="" className="h-full w-full object-cover" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.brand?.name && <p className="text-sm font-semibold text-brand-600">{product.brand.name}</p>}
          <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <StarRating rating={product.avg_rating} count={product.reviews_count} />
            <span className="text-xs text-slate-400">{product.sold_count} sold</span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Price amount={price} original={selectedVariant ? null : product.discount_price} size="lg" />
            {product.discount_percent > 0 && !selectedVariant && <Badge tone="accent">Save {product.discount_percent}%</Badge>}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-600">{product.short_description}</p>

          {Object.entries(groupedAttrs).map(([key, values]) => (
            <div key={key} className="mt-5">
              <p className="mb-2 text-sm font-semibold text-slate-700">{key}</p>
              <div className="flex flex-wrap gap-2">
                {values.map((val) => {
                  const variant = product.variants.find((v) => v.attributes[key] === val)
                  const active = selectedVariant?.attributes?.[key] === val
                  return (
                    <button
                      key={val}
                      onClick={() => setSelectedVariant(variant)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                        active ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {val}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="mt-5 flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Quantity</span>
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-1.5">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={14} /></button>
              <span className="w-6 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(stock || 1, q + 1))}><Plus size={14} /></button>
            </div>
            <span className={`text-xs font-medium ${stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {stock > 0 ? `${stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => handleAddToCart(false)} disabled={!stock} variant="primary" size="lg" className="flex-1">
              <ShoppingCart size={18} /> Add to Cart
            </Button>
            <Button onClick={() => handleAddToCart(true)} disabled={!stock} variant="accent" size="lg" className="flex-1">
              Buy Now
            </Button>
            <button
              onClick={() => (user ? toggleWishlist.mutate(product.id) : navigate('/login'))}
              className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-accent-500"
            >
              <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? 'text-accent-500' : ''} />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-600 sm:grid-cols-3">
            <span className="flex items-center gap-2"><Truck size={16} className="text-brand-600" /> Fast delivery</span>
            <span className="flex items-center gap-2"><RotateCcw size={16} className="text-brand-600" /> 7-day returns</span>
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-brand-600" /> Secure payment</span>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="flex gap-6 border-b border-slate-200 text-sm font-semibold text-slate-500">
          {['description', 'specifications', 'reviews'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 pb-3 capitalize ${tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent hover:text-slate-700'}`}
            >
              {t} {t === 'reviews' && `(${product.reviews_count})`}
            </button>
          ))}
        </div>

        <div className="py-6">
          {tab === 'description' && <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-slate-600">{product.description}</p>}

          {tab === 'specifications' && (
            <dl className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              {Object.entries(product.specifications || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-slate-100 py-2 text-sm">
                  <dt className="text-slate-500">{key}</dt>
                  <dd className="font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {tab === 'reviews' && (
            <div className="max-w-2xl space-y-6">
              {user && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    submitReview.mutate({ product_id: product.id, ...reviewForm })
                  }}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <p className="mb-2 text-sm font-semibold text-slate-700">Write a review</p>
                  <StarRating interactive rating={reviewForm.rating} showCount={false} onChange={(r) => setReviewForm((f) => ({ ...f, rating: r }))} />
                  <input
                    placeholder="Review title"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                    className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                  />
                  <textarea
                    placeholder="Share your experience..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                  />
                  <Button type="submit" size="sm" className="mt-2" loading={submitReview.isPending}>
                    Submit Review
                  </Button>
                </form>
              )}

              {product.reviews?.length ? (
                product.reviews.map((r) => (
                  <div key={r.id} className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">{r.customer_name}</span>
                      <span className="text-xs text-slate-400">{formatDate(r.created_at)}</span>
                    </div>
                    <StarRating rating={r.rating} showCount={false} size={13} />
                    {r.title && <p className="mt-1 text-sm font-semibold text-slate-700">{r.title}</p>}
                    <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          )}
        </div>
      </div>

      {related?.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-5 font-display text-xl font-bold text-slate-900">You may also like</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  )
}
