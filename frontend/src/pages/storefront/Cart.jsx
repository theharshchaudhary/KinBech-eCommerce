import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCartQuery, useRemoveCartItem, useUpdateCartItem } from '../../hooks/useCart'
import Price from '../../components/ui/Price'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import PageSpinner from '../../components/ui/PageSpinner'

export default function Cart() {
  const { data, isLoading } = useCartQuery()
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()

  if (isLoading) return <PageSpinner />

  const items = data?.items || []

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          action={
            <Button as={Link} to="/shop" className="mt-2">
              Continue Shopping
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-slate-900">Your Cart ({items.length})</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
              <img src={item.image} alt="" className="h-24 w-24 rounded-lg border border-slate-100 object-cover" />
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between">
                  <div>
                    <Link to={`/products/${item.product_slug}`} className="font-semibold text-slate-800 hover:text-brand-600">
                      {item.product_name}
                    </Link>
                    {item.variant_label && <p className="text-xs text-slate-400">{item.variant_label}</p>}
                    {!item.in_stock && <p className="text-xs font-semibold text-red-500">Out of stock</p>}
                  </div>
                  <button onClick={() => removeItem.mutate(item.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 rounded-full border border-slate-200 px-2 py-1">
                    <button onClick={() => updateItem.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}>
                      <Minus size={14} />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                      disabled={item.quantity >= item.available_stock}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <Price amount={item.line_total} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Order Summary</h2>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <Price amount={data.subtotal} size="sm" />
          </div>
          <p className="mt-1 text-xs text-slate-400">Shipping & taxes calculated at checkout.</p>
          <Button as={Link} to="/checkout" variant="accent" className="mt-5 w-full">
            Proceed to Checkout
          </Button>
          <Button as={Link} to="/shop" variant="ghost" className="mt-2 w-full">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  )
}
