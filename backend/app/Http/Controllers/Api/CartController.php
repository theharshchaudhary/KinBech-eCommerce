<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartItemResource;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $items = $request->user()->cartItems()
            ->with(['product.images', 'variant'])
            ->latest()
            ->get();

        return [
            'items' => CartItemResource::collection($items),
            'subtotal' => round($items->sum(fn ($i) => ($i->variant?->final_price ?? $i->product->final_price) * $i->quantity), 2),
        ];
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'product_variant_id' => ['nullable', 'exists:product_variants,id'],
            'quantity' => ['integer', 'min:1', 'max:99'],
        ]);

        $product = Product::findOrFail($data['product_id']);
        $variant = isset($data['product_variant_id']) ? ProductVariant::find($data['product_variant_id']) : null;
        $stock = $variant ? $variant->stock_quantity : $product->stock_quantity;

        if ($stock < 1) {
            throw ValidationException::withMessages(['product_id' => 'This item is currently out of stock.']);
        }

        $cartItem = $request->user()->cartItems()->firstOrNew([
            'product_id' => $product->id,
            'product_variant_id' => $variant?->id,
        ]);

        $cartItem->quantity = min($stock, $cartItem->exists ? $cartItem->quantity + ($data['quantity'] ?? 1) : ($data['quantity'] ?? 1));
        $cartItem->save();

        return new CartItemResource($cartItem->load(['product.images', 'variant']));
    }

    public function update(Request $request, CartItem $cartItem)
    {
        $this->authorizeOwner($request, $cartItem);

        $data = $request->validate(['quantity' => ['required', 'integer', 'min:1', 'max:99']]);

        $stock = $cartItem->variant ? $cartItem->variant->stock_quantity : $cartItem->product->stock_quantity;
        $cartItem->update(['quantity' => min($data['quantity'], $stock)]);

        return new CartItemResource($cartItem->load(['product.images', 'variant']));
    }

    public function destroy(Request $request, CartItem $cartItem)
    {
        $this->authorizeOwner($request, $cartItem);
        $cartItem->delete();

        return response()->json(['message' => 'Removed from cart.']);
    }

    public function clear(Request $request)
    {
        $request->user()->cartItems()->delete();

        return response()->json(['message' => 'Cart cleared.']);
    }

    protected function authorizeOwner(Request $request, CartItem $cartItem): void
    {
        abort_unless($cartItem->user_id === $request->user()->id, 403);
    }
}
