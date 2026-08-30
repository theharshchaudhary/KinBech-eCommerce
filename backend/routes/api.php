<?php

use App\Http\Controllers\Admin\BrandController as AdminBrandController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MessageController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/{category:slug}', [CategoryController::class, 'show']);
Route::get('brands', [BrandController::class, 'index']);

Route::get('products', [ProductController::class, 'index']);
Route::get('products/{slug}', [ProductController::class, 'show']);
Route::get('products/{slug}/related', [ProductController::class, 'related']);
Route::get('products/{product}/reviews', [ReviewController::class, 'index']);

Route::post('contact', [ContactController::class, 'store']);
Route::get('settings/public', [SettingController::class, 'public']);

/*
|--------------------------------------------------------------------------
| Authenticated customer routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('cart', [CartController::class, 'index']);
    Route::post('cart', [CartController::class, 'store']);
    Route::patch('cart/{cartItem}', [CartController::class, 'update']);
    Route::delete('cart/{cartItem}', [CartController::class, 'destroy']);
    Route::delete('cart', [CartController::class, 'clear']);

    Route::get('wishlist', [WishlistController::class, 'index']);
    Route::post('wishlist/toggle', [WishlistController::class, 'toggle']);
    Route::delete('wishlist/{id}', [WishlistController::class, 'destroy']);

    Route::put('account/profile', [AccountController::class, 'update']);

    Route::get('addresses', [AddressController::class, 'index']);
    Route::post('addresses', [AddressController::class, 'store']);
    Route::put('addresses/{address}', [AddressController::class, 'update']);
    Route::delete('addresses/{address}', [AddressController::class, 'destroy']);

    Route::post('reviews', [ReviewController::class, 'store']);

    Route::post('coupons/apply', [CouponController::class, 'apply']);

    Route::post('checkout', [CheckoutController::class, 'store']);
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{order}', [OrderController::class, 'show']);
    Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);
});

/*
|--------------------------------------------------------------------------
| Admin routes - every branch gated behind a granular Spatie permission
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->middleware(['auth:sanctum'])->name('admin.')->group(function () {

    Route::middleware('permission:dashboard.view')->get('dashboard', [DashboardController::class, 'index']);

    Route::middleware('permission:products.view')->group(function () {
        Route::get('products', [AdminProductController::class, 'index']);
        Route::get('products/{product}', [AdminProductController::class, 'show']);
    });

    Route::middleware('permission:products.manage')->group(function () {
        Route::post('products', [AdminProductController::class, 'store']);
        Route::put('products/{product}', [AdminProductController::class, 'update']);
        Route::delete('products/{product}', [AdminProductController::class, 'destroy']);
        Route::post('products/{product}/images', [AdminProductController::class, 'uploadImages']);
        Route::post('products/{product}/images/{image}/primary', [AdminProductController::class, 'setPrimaryImage']);
        Route::delete('products/{product}/images/{image}', [AdminProductController::class, 'deleteImage']);
        Route::post('products/{product}/variants', [AdminProductController::class, 'storeVariant']);
        Route::put('products/{product}/variants/{variant}', [AdminProductController::class, 'updateVariant']);
        Route::delete('products/{product}/variants/{variant}', [AdminProductController::class, 'deleteVariant']);
    });

    Route::middleware('permission:categories.manage')->group(function () {
        Route::get('categories', [AdminCategoryController::class, 'index']);
        Route::post('categories', [AdminCategoryController::class, 'store']);
        Route::post('categories/{category}', [AdminCategoryController::class, 'update']);
        Route::delete('categories/{category}', [AdminCategoryController::class, 'destroy']);
    });

    Route::middleware('permission:brands.manage')->group(function () {
        Route::get('brands', [AdminBrandController::class, 'index']);
        Route::post('brands', [AdminBrandController::class, 'store']);
        Route::post('brands/{brand}', [AdminBrandController::class, 'update']);
        Route::delete('brands/{brand}', [AdminBrandController::class, 'destroy']);
    });

    Route::middleware('permission:orders.view')->group(function () {
        Route::get('orders', [AdminOrderController::class, 'index']);
        Route::get('orders/{order}', [AdminOrderController::class, 'show']);
    });

    Route::middleware('permission:orders.manage')->group(function () {
        Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus']);
        Route::patch('orders/{order}/payment-status', [AdminOrderController::class, 'updatePaymentStatus']);
    });

    Route::middleware('permission:customers.view')->group(function () {
        Route::get('customers', [CustomerController::class, 'index']);
        Route::get('customers/{customer}', [CustomerController::class, 'show']);
    });

    Route::middleware('permission:customers.manage')->patch('customers/{customer}/toggle-active', [CustomerController::class, 'toggleActive']);

    Route::middleware('permission:admins.manage')->group(function () {
        Route::get('staff', [StaffController::class, 'index']);
        Route::post('staff', [StaffController::class, 'store']);
        Route::put('staff/{staffMember}', [StaffController::class, 'update']);
        Route::delete('staff/{staffMember}', [StaffController::class, 'destroy']);

        Route::get('roles', [RoleController::class, 'index']);
        Route::get('permissions', [RoleController::class, 'permissions']);
        Route::post('roles', [RoleController::class, 'store']);
        Route::put('roles/{role}', [RoleController::class, 'update']);
        Route::delete('roles/{role}', [RoleController::class, 'destroy']);
    });

    Route::middleware('permission:coupons.manage')->group(function () {
        Route::get('coupons', [AdminCouponController::class, 'index']);
        Route::post('coupons', [AdminCouponController::class, 'store']);
        Route::put('coupons/{coupon}', [AdminCouponController::class, 'update']);
        Route::delete('coupons/{coupon}', [AdminCouponController::class, 'destroy']);
    });

    Route::middleware('permission:reviews.moderate')->group(function () {
        Route::get('reviews', [AdminReviewController::class, 'index']);
        Route::patch('reviews/{review}/approve', [AdminReviewController::class, 'approve']);
        Route::delete('reviews/{review}', [AdminReviewController::class, 'destroy']);
    });

    Route::middleware('permission:messages.manage')->group(function () {
        Route::get('messages', [MessageController::class, 'index']);
        Route::get('messages/{message}', [MessageController::class, 'show']);
        Route::delete('messages/{message}', [MessageController::class, 'destroy']);
    });

    Route::middleware('permission:settings.manage')->group(function () {
        Route::get('settings', [AdminSettingController::class, 'index']);
        Route::put('settings/{group}', [AdminSettingController::class, 'update']);
        Route::post('settings/mail/test', [AdminSettingController::class, 'testMail']);
    });
});
