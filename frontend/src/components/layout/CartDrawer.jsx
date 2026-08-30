import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import useUiStore from '../../store/uiStore'
import { useCartQuery, useRemoveCartItem, useUpdateCartItem } from '../../hooks/useCart'
import Price from '../ui/Price'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'

export default function CartDrawer() {
  const { cartDrawerOpen, closeCartDrawer } = useUiStore()
  const { data } = useCartQuery()
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()

  const items = data?.items || []

  return (
    <Transition show={cartDrawerOpen} as={Fragment}>
      <Dialog onClose={closeCartDrawer} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/50" />
        </TransitionChild>

        <div className="fixed inset-0 flex justify-end">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <ShoppingBag size={20} /> Your Cart
                </h2>
                <button onClick={closeCartDrawer} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                {items.length === 0 ? (
                  <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Browse the shop and add items you love." />
                ) : (
                  <ul className="space-y-4">
                    {items.map((item) => (
                      <li key={item.id} className="flex gap-3">
                        <img src={item.image} alt="" className="h-16 w-16 rounded-lg border border-slate-100 object-cover" />
                        <div className="flex flex-1 flex-col">
                          <span className="text-sm font-semibold text-slate-800 line-clamp-1">{item.product_name}</span>
                          {item.variant_label && <span className="text-xs text-slate-400">{item.variant_label}</span>}
                          <Price amount={item.line_total} size="sm" />
                          <div className="mt-1 flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-full border border-slate-200 px-1.5 py-0.5">
                              <button
                                onClick={() => updateItem.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                                className="text-slate-500 hover:text-slate-800"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-4 text-center text-xs font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                                disabled={item.quantity >= item.available_stock}
                                className="text-slate-500 hover:text-slate-800 disabled:opacity-40"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                            <button onClick={() => removeItem.mutate(item.id)} className="text-slate-400 hover:text-red-500">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-slate-100 px-5 py-4">
                  <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>Subtotal</span>
                    <Price amount={data.subtotal} />
                  </div>
                  <Button as={Link} to="/cart" onClick={closeCartDrawer} variant="outline" className="mb-2 w-full">
                    View Cart
                  </Button>
                  <Button as={Link} to="/checkout" onClick={closeCartDrawer} variant="accent" className="w-full">
                    Checkout
                  </Button>
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
