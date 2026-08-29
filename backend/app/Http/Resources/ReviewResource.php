<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rating' => $this->rating,
            'title' => $this->title,
            'comment' => $this->comment,
            'is_approved' => $this->is_approved,
            'customer_name' => $this->whenLoaded('user', fn () => $this->user->name),
            'product_name' => $this->whenLoaded('product', fn () => $this->product->name),
            'created_at' => $this->created_at,
        ];
    }
}
