<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id', 'sku', 'attributes', 'price_override', 'stock_quantity', 'image', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'attributes' => 'array',
            'price_override' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    protected function finalPrice(): Attribute
    {
        return Attribute::get(fn () => (float) ($this->price_override ?? $this->product->final_price));
    }

    protected function label(): Attribute
    {
        return Attribute::get(function () {
            $attrs = $this->getAttribute('attributes') ?? [];

            return collect($attrs)->map(fn ($v, $k) => "{$k}: {$v}")->implode(', ');
        });
    }
}
