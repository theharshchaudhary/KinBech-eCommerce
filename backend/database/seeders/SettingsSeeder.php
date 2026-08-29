<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        Setting::setMany('general', [
            'site_name' => 'KinBech',
            'tagline' => 'Everything you need, delivered.',
            'support_email' => 'support@kinbech.test',
            'support_phone' => '+977-1-4000000',
            'logo' => null,
            'favicon' => null,
            'currency_code' => 'NPR',
            'currency_symbol' => 'Rs.',
        ], [
            'logo' => 'string', 'favicon' => 'string',
        ]);

        Setting::setMany('mail', [
            'driver' => 'log',
            'host' => '',
            'port' => '587',
            'username' => '',
            'password' => '',
            'encryption' => 'tls',
            'from_address' => 'no-reply@kinbech.test',
            'from_name' => 'KinBech',
        ], [
            'password' => 'encrypted',
        ]);

        Setting::setMany('payment', [
            'cod_enabled' => true,
            'mock_card_enabled' => true,
        ], [
            'cod_enabled' => 'boolean',
            'mock_card_enabled' => 'boolean',
        ]);

        Setting::setMany('shipping', [
            'flat_fee' => 150,
            'free_shipping_threshold' => 5000,
            'tax_rate_percent' => 0,
        ], [
            'flat_fee' => 'float',
            'free_shipping_threshold' => 'float',
            'tax_rate_percent' => 'float',
        ]);

        Setting::setMany('social', [
            'facebook' => '',
            'instagram' => '',
            'twitter' => '',
        ]);
    }
}
