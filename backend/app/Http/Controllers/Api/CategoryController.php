<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * Public category tree (top-level categories with their children) for
     * navigation menus and the shop sidebar filter.
     */
    public function index()
    {
        $categories = Category::query()
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->withCount('products')
            ->with(['children' => fn ($q) => $q->where('is_active', true)->withCount('products')])
            ->orderBy('sort_order')
            ->get();

        // A parent's displayed count includes products filed directly under
        // its subcategories, not just ones attached to the parent row itself.
        $categories->each(function (Category $category) {
            $category->products_count += $category->children->sum('products_count');
        });

        return CategoryResource::collection($categories);
    }

    public function show(Category $category)
    {
        $category->load(['children' => fn ($q) => $q->where('is_active', true)]);

        return new CategoryResource($category);
    }
}
