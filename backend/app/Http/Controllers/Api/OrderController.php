<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = $request->user()->orders()->with('items')->latest()->paginate(10);

        return OrderResource::collection($orders);
    }

    public function show(Request $request, Order $order)
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        return new OrderResource($order->load(['items', 'statusHistories']));
    }

    public function cancel(Request $request, Order $order)
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        if (! in_array($order->status, ['pending', 'processing'])) {
            throw ValidationException::withMessages(['status' => 'This order can no longer be cancelled.']);
        }

        $reason = $request->validate(['reason' => ['nullable', 'string', 'max:500']])['reason'] ?? 'Cancelled by customer.';

        $order->update(['status' => 'cancelled', 'cancel_reason' => $reason]);

        foreach ($order->items as $item) {
            if ($item->product_variant_id) {
                $item->variant?->increment('stock_quantity', $item->quantity);
            } else {
                $item->product?->increment('stock_quantity', $item->quantity);
            }
        }

        OrderStatusHistory::create(['order_id' => $order->id, 'status' => 'cancelled', 'note' => $reason]);

        return new OrderResource($order->load(['items', 'statusHistories']));
    }
}
