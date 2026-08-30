import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useWishlistQuery } from '../../hooks/useCart'
import ProductGrid from '../../components/product/ProductGrid'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import PageSpinner from '../../components/ui/PageSpinner'

export default function Wishlist() {
  const { data, isLoading } = useWishlistQuery()

  if (isLoading) return <PageSpinner />

  const products = (data || []).map((w) => w.product)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-slate-900">Your Wishlist ({products.length})</h1>
      {products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save items you love to buy them later."
          action={
            <Button as={Link} to="/shop" className="mt-2">
              Explore Products
            </Button>
          }
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
}
