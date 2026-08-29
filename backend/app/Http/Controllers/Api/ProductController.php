<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()
            ->where('is_active', true)
            ->with(['images', 'category', 'brand']);

        if ($request->filled('category')) {
            $category = Category::where('slug', $request->category)->first();

            if ($category) {
                $categoryIds = collect([$category->id])
                    ->merge($category->children()->pluck('id'));

                $query->whereIn('category_id', $categoryIds);
            }
        }

        if ($request->filled('brand')) {
            $query->whereIn('brand_id', (array) $request->brand);
        }

        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->whereFullText(['name', 'short_description'], $search)
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->filled('min_rating')) {
            $query->where('avg_rating', '>=', $request->min_rating);
        }

        if ($request->boolean('in_stock')) {
            $query->where('stock_quantity', '>', 0);
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        match ($request->get('sort', 'newest')) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'rating' => $query->orderByDesc('avg_rating'),
            'popularity' => $query->orderByDesc('sold_count'),
            default => $query->orderByDesc('published_at')->orderByDesc('id'),
        };

        $products = $query->paginate($request->get('per_page', 12))->withQueryString();

        return ProductResource::collection($products);
    }

    public function show(string $slug)
    {
        $product = Product::where('slug', $slug)
            ->where('is_active', true)
            ->with(['category', 'brand', 'images', 'variants' => fn ($q) => $q->where('is_active', true), 'approvedReviews.user'])
            ->firstOrFail();

        return new ProductDetailResource($product);
    }

    /**
     * Related products: same category, excluding the current product.
     */
    public function related(string $slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $related = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->with(['images'])
            ->limit(8)
            ->get();

        return ProductResource::collection($related);
    }
}
