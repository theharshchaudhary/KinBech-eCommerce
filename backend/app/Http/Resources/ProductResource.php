<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Lightweight product shape for listing grids (catalog, search, related products).
 */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $primaryImage = $this->relationLoaded('images')
            ? $this->images->firstWhere('is_primary', true) ?? $this->images->first()
            : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'price' => (float) $this->price,
            'discount_price' => $this->discount_price ? (float) $this->discount_price : null,
            'final_price' => $this->final_price,
            'discount_percent' => $this->discount_percent,
            'in_stock' => $this->in_stock,
            'avg_rating' => (float) $this->avg_rating,
            'reviews_count' => $this->reviews_count,
            'sold_count' => $this->sold_count,
            'is_featured' => $this->is_featured,
            'image' => $primaryImage ? asset('storage/'.$primaryImage->path) : null,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'brand' => $this->whenLoaded('brand', fn () => $this->brand ? [
                'id' => $this->brand->id,
                'name' => $this->brand->name,
            ] : null),
        ];
    }
}
