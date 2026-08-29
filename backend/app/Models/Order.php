<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'user_id', 'coupon_id',
        'shipping_full_name', 'shipping_phone', 'shipping_line1', 'shipping_line2',
        'shipping_city', 'shipping_state', 'shipping_country', 'shipping_postal_code',
        'subtotal', 'discount_amount', 'shipping_fee', 'tax_amount', 'total',
        'payment_method', 'payment_status', 'status', 'customer_note', 'cancel_reason',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'shipping_fee' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->latest();
    }

    public static function generateOrderNumber(): string
    {
        return 'KB-'.now()->format('Ymd').'-'.strtoupper(substr(uniqid(), -6));
    }
}
