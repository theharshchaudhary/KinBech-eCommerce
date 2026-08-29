<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $paidRevenue = Order::where('payment_status', 'paid')->sum('total');

        $revenueByDay = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subDays(13)->startOfDay())
            ->selectRaw('DATE(created_at) as day, SUM(total) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        $revenueSeries = collect(range(13, 0))->map(function ($daysAgo) use ($revenueByDay) {
            $day = Carbon::now()->subDays($daysAgo)->toDateString();

            return ['date' => $day, 'revenue' => (float) ($revenueByDay[$day] ?? 0)];
        });

        $statusBreakdown = Order::selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');

        $topProducts = Product::orderByDesc('sold_count')->take(5)->get(['id', 'name', 'sold_count', 'price']);

        return response()->json([
            'stats' => [
                'total_revenue' => (float) $paidRevenue,
                'orders_count' => Order::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'customers_count' => User::where('account_type', 'customer')->count(),
                'products_count' => Product::count(),
                'low_stock_count' => Product::whereColumn('stock_quantity', '<=', 'low_stock_threshold')->where('stock_quantity', '>', 0)->count(),
                'out_of_stock_count' => Product::where('stock_quantity', 0)->count(),
                'unread_messages' => ContactMessage::where('is_read', false)->count(),
                'pending_reviews' => \App\Models\Review::where('is_approved', false)->count(),
            ],
            'revenue_series' => $revenueSeries,
            'status_breakdown' => $statusBreakdown,
            'top_products' => $topProducts,
            'recent_orders' => Order::with('user')->latest()->take(6)->get()->map(fn ($o) => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'customer' => $o->user->name,
                'total' => (float) $o->total,
                'status' => $o->status,
                'created_at' => $o->created_at,
            ]),
            'low_stock_products' => Product::whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                ->orderBy('stock_quantity')
                ->take(6)
                ->get(['id', 'name', 'stock_quantity', 'low_stock_threshold']),
        ]);
    }
}
