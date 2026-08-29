<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;

class SettingController extends Controller
{
    /**
     * Public, non-sensitive settings the storefront needs: branding,
     * currency, which payment methods are turned on, shipping rules, socials.
     */
    public function public()
    {
        $all = Setting::allGrouped();

        return response()->json([
            'general' => $all['general'] ?? [],
            'payment' => $all['payment'] ?? [],
            'shipping' => $all['shipping'] ?? [],
            'social' => $all['social'] ?? [],
        ]);
    }
}
