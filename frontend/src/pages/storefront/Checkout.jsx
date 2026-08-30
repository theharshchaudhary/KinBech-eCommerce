import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CreditCard, MapPin, Plus, Truck } from 'lucide-react'
import { useCartQuery } from '../../hooks/useCart'
import { usePublicSettings } from '../../hooks/useCatalog'
import * as account from '../../api/account'
import PageSpinner from '../../components/ui/PageSpinner'
import Price from '../../components/ui/Price'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import AddressForm from '../../components/account/AddressForm'
import { formatMoney } from '../../lib/format'

export default function Checkout() {
  const navigate = useNavigate()
  const { data: cart, isLoading: loadingCart } = useCartQuery()
  const { data: settings } = usePublicSettings()
  const qc = useQueryClient()

  const { data: addresses, isLoading: loadingAddresses } = useQuery({ queryKey: ['addresses'], queryFn: account.getAddresses })
  const [addressId, setAddressId] = useState(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [card, setCard] = useState({ card_number: '', card_expiry: '', card_cvc: '' })
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!addressId && addresses?.length) {
      setAddressId(addresses.find((a) => a.is_default)?.id || addresses[0].id)
    }
  }, [addresses, addressId])

  const symbol = settings?.general?.currency_symbol || 'Rs.'
  const subtotal = cart?.subtotal || 0
  const discount = coupon?.discount_amount || 0
  const flatFee = Number(settings?.shipping?.flat_fee || 0)
  const freeThreshold = Number(settings?.shipping?.free_shipping_threshold || 0)
  const shippingFee = freeThreshold > 0 && subtotal - discount >= freeThreshold ? 0 : flatFee
  const taxRate = Number(settings?.shipping?.tax_rate_percent || 0)
  const taxAmount = Math.round(((subtotal - discount) * (taxRate / 100)) * 100) / 100
  const total = subtotal - discount + shippingFee + taxAmount

  const applyCoupon = useMutation({
    mutationFn: () => account.applyCoupon(couponCode, subtotal),
    onSuccess: (data) => {
      setCoupon(data)
      toast.success(`Coupon applied: -${formatMoney(data.discount_amount, symbol)}`)
    },
    onError: (err) => {
      setCoupon(null)
      toast.error(err?.response?.data?.message || 'Invalid coupon')
    },
  })

  const placeOrder = useMutation({
    mutationFn: account.placeOrder,
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['cart'] })
      navigate(`/order-confirmation/${order.id}`)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Could not place your order'),
  })

  const handlePlaceOrder = () => {
    if (!addressId) return toast.error('Please select a delivery address')
    placeOrder.mutate({
      address_id: addressId,
      payment_method: paymentMethod,
      coupon_code: coupon ? couponCode : undefined,
      customer_note: note || undefined,
      ...(paymentMethod === 'mock_card' ? card : {}),
    })
  }

  const paymentEnabled = useMemo(
    () => ({
      cod: settings?.payment?.cod_enabled !== false,
      mock_card: settings?.payment?.mock_card_enabled !== false,
    }),
    [settings],
  )

  if (loadingCart || loadingAddresses) return <PageSpinner />

  if (!cart?.items?.length) {
    navigate('/cart')
    return null
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-slate-900">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <MapPin size={18} /> Delivery Address
              </h2>
              <button onClick={() => setShowAddressModal(true)} className="flex items-center gap-1 text-sm font-semibold text-brand-600">
                <Plus size={14} /> Add New
              </button>
            </div>
            {addresses?.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`cursor-pointer rounded-lg border p-3 text-sm ${addressId === addr.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}
                  >
                    <input type="radio" name="address" className="sr-only" checked={addressId === addr.id} onChange={() => setAddressId(addr.id)} />
                    <p className="font-semibold text-slate-800">{addr.full_name} {addr.is_default && <span className="text-xs font-normal text-brand-600">(Default)</span>}</p>
                    <p className="text-slate-500">{addr.line1}, {addr.city}, {addr.state}</p>
                    <p className="text-slate-500">{addr.phone}</p>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No saved addresses yet. Add one to continue.</p>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
              <CreditCard size={18} /> Payment Method
            </h2>
            <div className="space-y-2">
              {paymentEnabled.cod && (
                <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${paymentMethod === 'cod' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}>
                  <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  <div>
                    <p className="font-semibold text-slate-800">Cash on Delivery</p>
                    <p className="text-xs text-slate-500">Pay when your order arrives</p>
                  </div>
                </label>
              )}
              {paymentEnabled.mock_card && (
                <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${paymentMethod === 'mock_card' ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}>
                  <input type="radio" checked={paymentMethod === 'mock_card'} onChange={() => setPaymentMethod('mock_card')} />
                  <div>
                    <p className="font-semibold text-slate-800">Credit / Debit Card</p>
                    <p className="text-xs text-slate-500">Simulated payment for demo purposes</p>
                  </div>
                </label>
              )}
            </div>

            {paymentMethod === 'mock_card' && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Card Number"
                  value={card.card_number}
                  onChange={(e) => setCard({ ...card, card_number: e.target.value })}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 sm:col-span-2"
                />
                <input
                  placeholder="MM/YY"
                  value={card.card_expiry}
                  onChange={(e) => setCard({ ...card, card_expiry: e.target.value })}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
                <input
                  placeholder="CVC"
                  value={card.card_cvc}
                  onChange={(e) => setCard({ ...card, card_cvc: e.target.value })}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
                <p className="text-xs text-slate-400 sm:col-span-2">No real payment is processed - this is a simulated card flow.</p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-2 text-base font-bold text-slate-900">Order Note (optional)</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Add delivery instructions..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </section>
        </div>

        <div className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
          <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between text-slate-600">
                <span className="line-clamp-1">{item.product_name} × {item.quantity}</span>
                <span>{formatMoney(item.line_total, symbol)}</span>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon code"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
            <Button variant="outline" size="sm" onClick={() => applyCoupon.mutate()} loading={applyCoupon.isPending}>
              Apply
            </Button>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatMoney(subtotal, symbol)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatMoney(discount, symbol)}</span></div>}
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1"><Truck size={13} /> Shipping</span>
              <span>{shippingFee === 0 ? 'Free' : formatMoney(shippingFee, symbol)}</span>
            </div>
            {taxAmount > 0 && <div className="flex justify-between text-slate-600"><span>Tax</span><span>{formatMoney(taxAmount, symbol)}</span></div>}
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
              <span>Total</span>
              <Price amount={total} size="sm" />
            </div>
          </div>

          <Button onClick={handlePlaceOrder} loading={placeOrder.isPending} variant="accent" className="w-full">
            Place Order
          </Button>
          <Link to="/cart" className="block text-center text-xs text-slate-400 hover:text-slate-600">Back to cart</Link>
        </div>
      </div>

      <Modal open={showAddressModal} onClose={() => setShowAddressModal(false)} title="Add New Address">
        <AddressForm
          onSuccess={(addr) => {
            qc.invalidateQueries({ queryKey: ['addresses'] })
            setAddressId(addr.id)
            setShowAddressModal(false)
          }}
        />
      </Modal>
    </div>
  )
}
