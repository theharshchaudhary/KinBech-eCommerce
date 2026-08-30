import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, ImageOff } from 'lucide-react'
import Badge from '../ui/Badge'
import Price from '../ui/Price'
import StarRating from '../ui/StarRating'
import { useAddToCart, useWishlistQuery, useToggleWishlist } from '../../hooks/useCart'
import useAuthStore from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function ProductCard({ product }) {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const addToCart = useAddToCart()
  const toggleWishlist = useToggleWishlist()
  const { data: wishlist } = useWishlistQuery()

  const isWishlisted = wishlist?.some((w) => w.product.id === product.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (!user) return navigate('/login')
    addToCart.mutate({ product_id: product.id, quantity: 1 })
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    if (!user) return navigate('/login')
    toggleWishlist.mutate(product.id)
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <ImageOff size={32} />
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.discount_percent > 0 && <Badge tone="accent">-{product.discount_percent}%</Badge>}
          {product.is_featured && <Badge tone="brand">Bestseller</Badge>}
          {!product.in_stock && <Badge tone="red">Out of stock</Badge>}
        </div>

        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm transition hover:text-accent-500"
        >
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? 'text-accent-500' : ''} />
        </button>

        <button
          onClick={handleAddToCart}
          disabled={!product.in_stock}
          className="absolute inset-x-2 bottom-2 flex translate-y-10 items-center justify-center gap-2 rounded-lg bg-brand-900/90 py-2 text-sm font-semibold text-white opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <ShoppingCart size={15} /> Add to cart
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {product.category?.name && <span className="text-[11px] font-medium uppercase tracking-wide text-brand-600">{product.category.name}</span>}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-slate-800">{product.name}</h3>
        <StarRating rating={product.avg_rating} count={product.reviews_count} size={13} />
        <Price amount={product.final_price} original={product.discount_price ? product.price : null} size="sm" />
      </div>
    </Link>
  )
}
