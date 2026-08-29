<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WishlistResource;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        return WishlistResource::collection(
            $request->user()->wishlists()->with(['product.images', 'product.category'])->latest()->get()
        );
    }

    /**
     * Toggle a product's wishlist state for the current user.
     */
    public function toggle(Request $request)
    {
        $data = $request->validate(['product_id' => ['required', 'exists:products,id']]);

        $existing = $request->user()->wishlists()->where('product_id', $data['product_id'])->first();

        if ($existing) {
            $existing->delete();

            return response()->json(['wishlisted' => false]);
        }

        $request->user()->wishlists()->create(['product_id' => $data['product_id']]);

        return response()->json(['wishlisted' => true]);
    }

    public function destroy(Request $request, int $id)
    {
        $request->user()->wishlists()->where('id', $id)->delete();

        return response()->json(['message' => 'Removed from wishlist.']);
    }
}
