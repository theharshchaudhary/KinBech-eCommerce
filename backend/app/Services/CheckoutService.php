<?php

namespace App\Services;

use App\Models\Address;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\OrderPlaced;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutService
{
    /**
     * Turn a customer's cart into a placed order: revalidates stock and
     * pricing server-side, snapshots line items, applies the coupon (if
     * any), decrements inventory, and clears the cart - all atomically.
     */
    public function place(User $user, array $data): Order
    {
        $cartItems = $user->cartItems()->with(['product', 'variant'])->get();

        if ($cartItems->isEmpty()) {
            throw ValidationException::withMessages(['cart' => 'Your cart is empty.']);
        }

        foreach ($cartItems as $item) {
            $stock = $item->variant ? $item->variant->stock_quantity : $item->product->stock_quantity;

            if ($item->quantity > $stock) {
                throw ValidationException::withMessages([
                    'cart' => "Only {$stock} unit(s) of \"{$item->product->name}\" left in stock.",
                ]);
            }
        }

        $address = Address::where('id', $data['address_id'])->where('user_id', $user->id)->firstOrFail();

        $subtotal = round($cartItems->sum(fn ($i) => ($i->variant?->final_price ?? $i->product->final_price) * $i->quantity), 2);

        $coupon = null;
        $discount = 0;

        if (! empty($data['coupon_code'])) {
            $coupon = Coupon::whereRaw('UPPER(code) = ?', [strtoupper($data['coupon_code'])])->first();

            if (! $coupon || ! $coupon->isValidFor($subtotal)) {
                throw ValidationException::withMessages(['coupon_code' => 'This coupon is invalid or no longer applies.']);
            }

            $discount = $coupon->calculateDiscount($subtotal);
        }

        $shippingFee = (float) Setting::get('shipping.flat_fee', 0);
        $freeThreshold = (float) Setting::get('shipping.free_shipping_threshold', 0);

        if ($freeThreshold > 0 && ($subtotal - $discount) >= $freeThreshold) {
            $shippingFee = 0;
        }

        $taxRate = (float) Setting::get('shipping.tax_rate_percent', 0);
        $taxAmount = round(($subtotal - $discount) * ($taxRate / 100), 2);
        $total = round($subtotal - $discount + $shippingFee + $taxAmount, 2);

        return DB::transaction(function () use ($user, $data, $cartItems, $address, $coupon, $discount, $subtotal, $shippingFee, $taxAmount, $total) {
            $paymentStatus = $data['payment_method'] === 'mock_card' ? 'paid' : 'pending';

            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $user->id,
                'coupon_id' => $coupon?->id,
                'shipping_full_name' => $address->full_name,
                'shipping_phone' => $address->phone,
                'shipping_line1' => $address->line1,
                'shipping_line2' => $address->line2,
                'shipping_city' => $address->city,
                'shipping_state' => $address->state,
                'shipping_country' => $address->country,
                'shipping_postal_code' => $address->postal_code,
                'subtotal' => $subtotal,
                'discount_amount' => $discount,
                'shipping_fee' => $shippingFee,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'payment_method' => $data['payment_method'],
                'payment_status' => $paymentStatus,
                'status' => 'pending',
                'customer_note' => $data['customer_note'] ?? null,
            ]);

            foreach ($cartItems as $item) {
                $unitPrice = $item->variant?->final_price ?? $item->product->final_price;
                $image = $item->variant?->image
                    ?? $item->product->images()->where('is_primary', true)->value('path')
                    ?? $item->product->images()->value('path');

                $order->items()->create([
                    'product_id' => $item->product_id,
                    'product_variant_id' => $item->product_variant_id,
                    'product_name' => $item->product->name,
                    'variant_label' => $item->variant?->label,
                    'product_image' => $image,
                    'unit_price' => $unitPrice,
                    'quantity' => $item->quantity,
                    'line_total' => round($unitPrice * $item->quantity, 2),
                ]);

                if ($item->variant) {
                    $item->variant->decrement('stock_quantity', $item->quantity);
                } else {
                    $item->product->decrement('stock_quantity', $item->quantity);
                }

                $item->product->increment('sold_count', $item->quantity);
            }

            if ($coupon) {
                $coupon->increment('used_count');
            }

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => 'pending',
                'note' => 'Order placed by customer.',
            ]);

            $user->cartItems()->delete();

            $order->user->notify(new OrderPlaced($order));

            return $order->load(['items', 'statusHistories']);
        });
    }
}
