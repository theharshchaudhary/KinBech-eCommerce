<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id', 'brand_id', 'name', 'slug', 'sku', 'short_description', 'description',
        'price', 'discount_price', 'stock_quantity', 'low_stock_threshold', 'weight_kg',
        'specifications', 'is_active', 'is_featured', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'discount_price' => 'decimal:2',
            'avg_rating' => 'decimal:2',
            'specifications' => 'array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Product $product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name).'-'.Str::random(5);
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function approvedReviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('is_approved', true)->latest();
    }

    protected function finalPrice(): Attribute
    {
        return Attribute::get(fn () => (float) ($this->discount_price ?? $this->price));
    }

    protected function discountPercent(): Attribute
    {
        return Attribute::get(function () {
            if (! $this->discount_price || (float) $this->price <= 0) {
                return 0;
            }

            return (int) round((1 - ($this->discount_price / $this->price)) * 100);
        });
    }

    protected function inStock(): Attribute
    {
        return Attribute::get(fn () => $this->stock_quantity > 0);
    }

    protected function isLowStock(): Attribute
    {
        return Attribute::get(fn () => $this->stock_quantity > 0 && $this->stock_quantity <= $this->low_stock_threshold);
    }
}
