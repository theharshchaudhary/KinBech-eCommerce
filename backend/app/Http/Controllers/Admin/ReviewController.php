<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with(['user', 'product']);

        if ($request->filled('status')) {
            $query->where('is_approved', $request->status === 'approved');
        }

        return ReviewResource::collection($query->latest()->paginate($request->get('per_page', 15)));
    }

    public function approve(Review $review)
    {
        $review->update(['is_approved' => true]);
        $this->refreshProductRating($review->product);

        return new ReviewResource($review);
    }

    public function destroy(Review $review)
    {
        $product = $review->product;
        $review->delete();
        $this->refreshProductRating($product);

        return response()->json(['message' => 'Review removed.']);
    }

    protected function refreshProductRating(Product $product): void
    {
        $approved = $product->approvedReviews();

        $product->update([
            'avg_rating' => round($approved->avg('rating') ?? 0, 2),
            'reviews_count' => $approved->count(),
        ]);
    }
}
