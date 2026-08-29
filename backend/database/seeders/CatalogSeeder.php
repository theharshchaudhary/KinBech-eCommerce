<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $electronics = Category::updateOrCreate(['slug' => 'electronics'], ['name' => 'Electronics', 'sort_order' => 1]);
        $mobiles = Category::updateOrCreate(['slug' => 'mobiles-tablets'], ['name' => 'Mobiles & Tablets', 'parent_id' => $electronics->id, 'sort_order' => 1]);
        $laptops = Category::updateOrCreate(['slug' => 'laptops-computers'], ['name' => 'Laptops & Computers', 'parent_id' => $electronics->id, 'sort_order' => 2]);
        $cameras = Category::updateOrCreate(['slug' => 'cameras'], ['name' => 'Cameras', 'parent_id' => $electronics->id, 'sort_order' => 3]);
        $tvs = Category::updateOrCreate(['slug' => 'televisions'], ['name' => 'Televisions', 'parent_id' => $electronics->id, 'sort_order' => 4]);
        $accessories = Category::updateOrCreate(['slug' => 'computer-accessories'], ['name' => 'Computer Accessories', 'parent_id' => $electronics->id, 'sort_order' => 5]);

        $home = Category::updateOrCreate(['slug' => 'home-kitchen'], ['name' => 'Home & Kitchen', 'sort_order' => 2]);
        $fridges = Category::updateOrCreate(['slug' => 'refrigerators'], ['name' => 'Refrigerators', 'parent_id' => $home->id, 'sort_order' => 1]);
        $washers = Category::updateOrCreate(['slug' => 'washing-machines'], ['name' => 'Washing Machines', 'parent_id' => $home->id, 'sort_order' => 2]);
        $kitchen = Category::updateOrCreate(['slug' => 'kitchen-appliances'], ['name' => 'Kitchen Appliances', 'parent_id' => $home->id, 'sort_order' => 3]);

        $fashion = Category::updateOrCreate(['slug' => 'fashion'], ['name' => 'Fashion', 'sort_order' => 3]);
        $watches = Category::updateOrCreate(['slug' => 'watches'], ['name' => 'Watches', 'parent_id' => $fashion->id, 'sort_order' => 1]);

        $brands = collect([
            'Samsung', 'Dell', 'Canon', 'LG', 'Philips', 'Logitech', 'Fossil', 'Apple', 'Sony',
        ])->mapWithKeys(fn ($name) => [$name => Brand::updateOrCreate(['slug' => \Illuminate\Support\Str::slug($name)], ['name' => $name])]);

        $products = [
            [
                'name' => 'Galaxy Nova 5G Smartphone', 'sku' => 'SMT-001', 'category' => $mobiles, 'brand' => 'Samsung',
                'price' => 45999, 'discount_price' => 42999, 'stock' => 25,
                'short' => '6.7" AMOLED display, 5G, 128GB storage, triple camera.',
                'images' => ['smartphone-1.webp', 'smartphone-2.webp', 'smartphone-3.webp'],
                'specs' => ['Display' => '6.7" AMOLED', 'Storage' => '128GB', 'RAM' => '8GB', 'Battery' => '5000mAh'],
                'variants' => [
                    ['Color' => 'Midnight Black'], ['Color' => 'Ocean Blue'], ['Color' => 'Rose Gold'],
                ],
                'featured' => true,
            ],
            [
                'name' => 'Inspiron ProBook 14 Laptop', 'sku' => 'LAP-001', 'category' => $laptops, 'brand' => 'Dell',
                'price' => 89999, 'discount_price' => 84999, 'stock' => 15,
                'short' => '14" FHD, Intel Core i5, 16GB RAM, 512GB SSD.',
                'images' => ['laptop-1.webp', 'laptop-2.webp', 'laptop-3.webp'],
                'specs' => ['Processor' => 'Intel Core i5-13th Gen', 'RAM' => '16GB', 'Storage' => '512GB SSD', 'Display' => '14" FHD'],
                'featured' => true,
            ],
            [
                'name' => 'PowerShot X3 DSLR Camera', 'sku' => 'CAM-001', 'category' => $cameras, 'brand' => 'Canon',
                'price' => 65999, 'discount_price' => null, 'stock' => 10,
                'short' => '24MP DSLR with 18-55mm lens kit, 4K video.',
                'images' => ['camera-1.webp', 'camera-2.webp', 'camera-3.webp'],
                'specs' => ['Sensor' => '24MP APS-C', 'Video' => '4K/30fps', 'Lens' => '18-55mm kit'],
            ],
            [
                'name' => 'UltraView 55" 4K Smart TV', 'sku' => 'TV-001', 'category' => $tvs, 'brand' => 'LG',
                'price' => 55999, 'discount_price' => 49999, 'stock' => 12,
                'short' => '55" 4K UHD Smart TV with WebOS and HDR10.',
                'images' => ['tv-01.webp', 'tv-02.webp', 'tv-03.webp'],
                'specs' => ['Screen Size' => '55"', 'Resolution' => '4K UHD', 'Smart OS' => 'WebOS', 'HDR' => 'HDR10'],
                'featured' => true,
            ],
            [
                'name' => 'FreshChill 380L Double Door Refrigerator', 'sku' => 'FRG-001', 'category' => $fridges, 'brand' => 'Samsung',
                'price' => 72999, 'discount_price' => 68999, 'stock' => 8,
                'short' => '380L frost-free double door refrigerator with digital inverter.',
                'images' => ['fridge-1.webp', 'fridge-2.webp', 'fridge-3.webp'],
                'specs' => ['Capacity' => '380L', 'Type' => 'Frost Free', 'Compressor' => 'Digital Inverter'],
            ],
            [
                'name' => 'SpinPro 8kg Front Load Washing Machine', 'sku' => 'WM-001', 'category' => $washers, 'brand' => 'LG',
                'price' => 42999, 'discount_price' => null, 'stock' => 10,
                'short' => '8kg front load washing machine with steam wash technology.',
                'images' => ['washing-machine-1.webp', 'washing-machine-2.webp', 'washing-machine-3.webp'],
                'specs' => ['Capacity' => '8kg', 'Type' => 'Front Load', 'Technology' => 'Steam Wash'],
            ],
            [
                'name' => 'BlendMax 750W Stand Mixer', 'sku' => 'MIX-001', 'category' => $kitchen, 'brand' => 'Philips',
                'price' => 4999, 'discount_price' => 3999, 'stock' => 40,
                'short' => '750W stand mixer with 3 speed settings and stainless steel jar.',
                'images' => ['mixer-1.webp', 'mixer-2.webp', 'mixer-3.webp'],
                'specs' => ['Power' => '750W', 'Speeds' => '3', 'Jar Material' => 'Stainless Steel'],
            ],
            [
                'name' => 'PrecisionClick Wireless Mouse', 'sku' => 'MOU-001', 'category' => $accessories, 'brand' => 'Logitech',
                'price' => 1499, 'discount_price' => 1199, 'stock' => 100,
                'short' => 'Ergonomic wireless mouse with silent clicks and 1600 DPI.',
                'images' => ['mouse-1.webp', 'mouse-2.webp', 'mouse-3.webp'],
                'specs' => ['Connectivity' => 'Wireless 2.4GHz', 'DPI' => '1600', 'Battery Life' => '12 months'],
                'variants' => [['Color' => 'Black'], ['Color' => 'White'], ['Color' => 'Grey']],
                'featured' => true,
            ],
            [
                'name' => 'Heritage Chrono Analog Watch', 'sku' => 'WAT-001', 'category' => $watches, 'brand' => 'Fossil',
                'price' => 8999, 'discount_price' => 7499, 'stock' => 30,
                'short' => 'Classic chronograph watch with genuine leather strap.',
                'images' => ['watch-1.webp', 'watch-2.webp', 'watch-3.webp'],
                'specs' => ['Movement' => 'Quartz Chronograph', 'Strap' => 'Genuine Leather', 'Water Resistance' => '5 ATM'],
                'variants' => [['Strap Color' => 'Brown'], ['Strap Color' => 'Black'], ['Strap Color' => 'Tan']],
                'featured' => true,
            ],
        ];

        $customer = User::where('account_type', 'customer')->first();
        $reviewTexts = [
            5 => ['Excellent quality, exactly as described. Highly recommend!', 'Best purchase this year, super fast delivery too.'],
            4 => ['Really good product for the price. Minor issues but overall happy.', 'Works great, would buy again.'],
            3 => ['Decent, does the job but nothing exceptional.'],
        ];

        foreach ($products as $data) {
            $product = Product::updateOrCreate(
                ['sku' => $data['sku']],
                [
                    'category_id' => $data['category']->id,
                    'brand_id' => $brands[$data['brand']]->id,
                    'name' => $data['name'],
                    'short_description' => $data['short'],
                    'description' => $data['short'].' Built for everyday reliability with a manufacturer warranty and dedicated after-sales support through KinBech.',
                    'price' => $data['price'],
                    'discount_price' => $data['discount_price'],
                    'stock_quantity' => $data['stock'],
                    'specifications' => $data['specs'],
                    'is_active' => true,
                    'is_featured' => $data['featured'] ?? false,
                    'published_at' => now(),
                    'avg_rating' => 4.3,
                    'reviews_count' => 2,
                    'sold_count' => random_int(5, 120),
                ]
            );

            foreach ($data['images'] as $i => $image) {
                ProductImage::updateOrCreate(
                    ['product_id' => $product->id, 'path' => "products/{$image}"],
                    ['is_primary' => $i === 0, 'sort_order' => $i]
                );
            }

            foreach ($data['variants'] ?? [] as $i => $attrs) {
                ProductVariant::updateOrCreate(
                    ['sku' => $data['sku'].'-V'.($i + 1)],
                    [
                        'product_id' => $product->id,
                        'attributes' => $attrs,
                        'stock_quantity' => random_int(5, 30),
                        'image' => 'products/'.$data['images'][0],
                        'is_active' => true,
                    ]
                );
            }

            if ($customer) {
                Review::updateOrCreate(
                    ['product_id' => $product->id, 'user_id' => $customer->id],
                    [
                        'rating' => 5,
                        'title' => 'Great buy!',
                        'comment' => $reviewTexts[5][array_rand($reviewTexts[5])],
                        'is_approved' => true,
                    ]
                );
            }
        }

        Coupon::updateOrCreate(['code' => 'WELCOME10'], [
            'type' => 'percentage', 'value' => 10, 'min_order_amount' => 2000,
            'max_discount_amount' => 1000, 'usage_limit' => 500, 'is_active' => true,
        ]);

        Coupon::updateOrCreate(['code' => 'FLAT500'], [
            'type' => 'fixed', 'value' => 500, 'min_order_amount' => 5000,
            'usage_limit' => null, 'is_active' => true,
        ]);
    }
}
