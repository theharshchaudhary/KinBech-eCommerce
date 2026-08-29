<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $product = $this->product;
        $variant = $this->variant;
        $unitPrice = $variant ? $variant->final_price : $product->final_price;
        $image = $variant?->image ?? $product->images->firstWhere('is_primary', true)?->path ?? $product->images->first()?->path;

        return [
            'id' => $this->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_slug' => $product->slug,
            'variant_id' => $this->product_variant_id,
            'variant_label' => $variant?->label,
            'image' => $image ? asset('storage/'.$image) : null,
            'unit_price' => $unitPrice,
            'quantity' => $this->quantity,
            'line_total' => round($unitPrice * $this->quantity, 2),
            'available_stock' => $variant ? $variant->stock_quantity : $product->stock_quantity,
            'in_stock' => ($variant ? $variant->stock_quantity : $product->stock_quantity) > 0,
        ];
    }
}
