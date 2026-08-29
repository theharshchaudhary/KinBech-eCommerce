<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Notifications\OrderStatusUpdated;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::query()->with(['user']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('order_number', 'like', "%{$request->q}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$request->q}%")->orWhere('email', 'like', "%{$request->q}%"));
            });
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        return OrderResource::collection($query->latest()->paginate($request->get('per_page', 15)));
    }

    public function show(Order $order)
    {
        return new OrderResource($order->load(['user', 'items', 'statusHistories.changedBy']));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,processing,shipped,delivered,cancelled'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $order->update(['status' => $data['status']]);

        if ($data['status'] === 'delivered' && $order->payment_method === 'cod') {
            $order->update(['payment_status' => 'paid']);
        }

        OrderStatusHistory::create([
            'order_id' => $order->id,
            'status' => $data['status'],
            'note' => $data['note'] ?? null,
            'changed_by' => $request->user()->id,
        ]);

        $order->user->notify(new OrderStatusUpdated($order, $data['note'] ?? null));

        return new OrderResource($order->load(['user', 'items', 'statusHistories']));
    }

    public function updatePaymentStatus(Request $request, Order $order)
    {
        $data = $request->validate(['payment_status' => ['required', 'in:pending,paid,failed,refunded']]);
        $order->update($data);

        return new OrderResource($order);
    }
}
