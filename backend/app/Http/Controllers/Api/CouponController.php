<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CouponController extends Controller
{
    public function apply(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string'],
            'subtotal' => ['required', 'numeric', 'min:0'],
        ]);

        $coupon = Coupon::whereRaw('UPPER(code) = ?', [strtoupper($data['code'])])->first();

        if (! $coupon || ! $coupon->isValidFor((float) $data['subtotal'])) {
            throw ValidationException::withMessages(['code' => 'This coupon code is invalid or does not apply to your order.']);
        }

        return response()->json([
            'code' => $coupon->code,
            'coupon_id' => $coupon->id,
            'discount_amount' => $coupon->calculateDiscount((float) $data['subtotal']),
        ]);
    }
}
