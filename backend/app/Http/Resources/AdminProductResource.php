<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Product shape for the admin product list - includes management fields
 * (sku, real stock count, active flag) the public ProductResource omits.
 */
class AdminProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $primaryImage = $this->relationLoaded('images')
            ? $this->images->firstWhere('is_primary', true) ?? $this->images->first()
            : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'sku' => $this->sku,
            'slug' => $this->slug,
            'price' => (float) $this->price,
            'discount_price' => $this->discount_price ? (float) $this->discount_price : null,
            'final_price' => $this->final_price,
            'stock_quantity' => $this->stock_quantity,
            'in_stock' => $this->in_stock,
            'is_low_stock' => $this->is_low_stock,
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'image' => $primaryImage ? asset('storage/'.$primaryImage->path) : null,
            'category' => $this->whenLoaded('category', fn () => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ] : null),
            'brand' => $this->whenLoaded('brand', fn () => $this->brand ? ['id' => $this->brand->id, 'name' => $this->brand->name] : null),
            'created_at' => $this->created_at,
        ];
    }
}
