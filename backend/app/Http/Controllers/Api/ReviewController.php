<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    public function index(Product $product)
    {
        return ReviewResource::collection(
            $product->approvedReviews()->with('user')->paginate(10)
        );
    }

    public function store(ReviewRequest $request)
    {
        $user = $request->user();

        if (Review::where('product_id', $request->product_id)->where('user_id', $user->id)->exists()) {
            throw ValidationException::withMessages(['product_id' => 'You have already reviewed this product.']);
        }

        // Verified-purchase badge: was this product actually delivered to this customer?
        $orderItem = OrderItem::whereHas('order', fn ($q) => $q->where('user_id', $user->id)->where('status', 'delivered'))
            ->where('product_id', $request->product_id)
            ->first();

        $review = Review::create([
            'product_id' => $request->product_id,
            'user_id' => $user->id,
            'order_item_id' => $orderItem?->id,
            'rating' => $request->rating,
            'title' => $request->title,
            'comment' => $request->comment,
            'is_approved' => false,
        ]);

        return new ReviewResource($review);
    }
}
