<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('account_type', 'customer')->withCount('orders');

        if ($request->filled('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->q}%")->orWhere('email', 'like', "%{$request->q}%");
            });
        }

        return UserResource::collection($query->latest()->paginate($request->get('per_page', 15)));
    }

    public function show(User $customer)
    {
        abort_unless($customer->account_type === 'customer', 404);

        return [
            'customer' => new UserResource($customer),
            'orders' => OrderResource::collection($customer->orders()->with('items')->latest()->get()),
            'addresses' => $customer->addresses,
        ];
    }

    public function toggleActive(User $customer)
    {
        abort_unless($customer->account_type === 'customer', 404);
        $customer->update(['is_active' => ! $customer->is_active]);

        return new UserResource($customer);
    }
}
