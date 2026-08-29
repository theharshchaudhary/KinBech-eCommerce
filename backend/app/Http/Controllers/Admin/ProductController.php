<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductImageResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()->with(['category', 'brand', 'images']);

        if ($request->filled('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->q}%")->orWhere('sku', 'like', "%{$request->q}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        if ($request->boolean('low_stock')) {
            $query->whereColumn('stock_quantity', '<=', 'low_stock_threshold')->where('stock_quantity', '>', 0);
        }

        return ProductResource::collection($query->latest()->paginate($request->get('per_page', 15)));
    }

    public function store(ProductRequest $request)
    {
        $product = Product::create($request->validated() + ['published_at' => now()]);

        return new ProductDetailResource($product->load(['category', 'brand', 'images', 'variants']));
    }

    public function show(Product $product)
    {
        return new ProductDetailResource($product->load(['category', 'brand', 'images', 'variants', 'reviews.user']));
    }

    public function update(ProductRequest $request, Product $product)
    {
        $product->update($request->validated());

        return new ProductDetailResource($product->load(['category', 'brand', 'images', 'variants']));
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    public function uploadImages(Request $request, Product $product)
    {
        $request->validate([
            'images' => ['required', 'array', 'max:8'],
            'images.*' => ['image', 'max:4096'],
        ]);

        $hasPrimary = $product->images()->where('is_primary', true)->exists();
        $nextOrder = (int) $product->images()->max('sort_order') + 1;

        foreach ($request->file('images') as $i => $file) {
            $path = $file->store('products', 'public');

            $product->images()->create([
                'path' => $path,
                'is_primary' => ! $hasPrimary && $i === 0,
                'sort_order' => $nextOrder + $i,
            ]);
        }

        return ProductImageResource::collection($product->images()->get());
    }

    public function setPrimaryImage(Product $product, ProductImage $image)
    {
        abort_unless($image->product_id === $product->id, 404);

        $product->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);

        return ProductImageResource::collection($product->images()->get());
    }

    public function deleteImage(Product $product, ProductImage $image)
    {
        abort_unless($image->product_id === $product->id, 404);

        Storage::disk('public')->delete($image->path);
        $image->delete();

        return response()->json(['message' => 'Image removed.']);
    }

    public function storeVariant(Request $request, Product $product)
    {
        $data = $this->validateVariant($request, $product);
        $variant = $product->variants()->create($data);

        return new ProductVariantResource($variant);
    }

    public function updateVariant(Request $request, Product $product, ProductVariant $variant)
    {
        abort_unless($variant->product_id === $product->id, 404);

        $data = $this->validateVariant($request, $product, $variant->id);
        $variant->update($data);

        return new ProductVariantResource($variant);
    }

    public function deleteVariant(Product $product, ProductVariant $variant)
    {
        abort_unless($variant->product_id === $product->id, 404);
        $variant->delete();

        return response()->json(['message' => 'Variant removed.']);
    }

    protected function validateVariant(Request $request, Product $product, ?int $ignoreId = null): array
    {
        return $request->validate([
            'sku' => ['required', 'string', 'max:60', \Illuminate\Validation\Rule::unique('product_variants', 'sku')->ignore($ignoreId)],
            'attributes' => ['required', 'array', 'min:1'],
            'price_override' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);
    }
}
