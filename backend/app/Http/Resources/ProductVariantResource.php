<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'attributes' => $this->attributes,
            'label' => $this->label,
            'price' => $this->final_price,
            'stock_quantity' => $this->stock_quantity,
            'in_stock' => $this->stock_quantity > 0,
            'image' => $this->image ? asset('storage/'.$this->image) : null,
            'is_active' => $this->is_active,
        ];
    }
}
