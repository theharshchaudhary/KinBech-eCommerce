<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;

class SettingController extends Controller
{
    protected const GROUPS = ['general', 'mail', 'payment', 'shipping', 'social', 'seo'];

    /**
     * All settings groups. The mail password is never echoed back in
     * plaintext - the UI only learns whether one has been set.
     */
    public function index()
    {
        $all = Setting::allGrouped();

        if (isset($all['mail']['password'])) {
            $all['mail']['password_set'] = ! empty($all['mail']['password']);
            unset($all['mail']['password']);
        }

        return response()->json($all);
    }

    public function update(Request $request, string $group)
    {
        abort_unless(in_array($group, self::GROUPS), 404);

        $data = match ($group) {
            'general' => $request->validate([
                'site_name' => ['required', 'string', 'max:100'],
                'tagline' => ['nullable', 'string', 'max:200'],
                'support_email' => ['nullable', 'email'],
                'support_phone' => ['nullable', 'string', 'max:30'],
                'currency_code' => ['required', 'string', 'max:5'],
                'currency_symbol' => ['required', 'string', 'max:5'],
            ]),
            'mail' => $request->validate([
                'driver' => ['required', 'in:log,smtp'],
                'host' => ['nullable', 'string', 'max:150'],
                'port' => ['nullable', 'string', 'max:6'],
                'username' => ['nullable', 'string', 'max:150'],
                'password' => ['nullable', 'string', 'max:255'],
                'encryption' => ['nullable', 'in:tls,ssl,'],
                'from_address' => ['required', 'email'],
                'from_name' => ['required', 'string', 'max:100'],
            ]),
            'payment' => $request->validate([
                'cod_enabled' => ['boolean'],
                'mock_card_enabled' => ['boolean'],
            ]),
            'shipping' => $request->validate([
                'flat_fee' => ['required', 'numeric', 'min:0'],
                'free_shipping_threshold' => ['required', 'numeric', 'min:0'],
                'tax_rate_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            ]),
            'social' => $request->validate([
                'facebook' => ['nullable', 'string', 'max:255'],
                'instagram' => ['nullable', 'string', 'max:255'],
                'twitter' => ['nullable', 'string', 'max:255'],
            ]),
            default => [],
        };

        // Keep the existing SMTP password if the admin left the field blank.
        if ($group === 'mail' && empty($data['password'])) {
            unset($data['password']);
        }

        $types = $group === 'mail' ? ['password' => 'encrypted'] : [];
        $booleanKeys = ['cod_enabled', 'mock_card_enabled'];

        foreach ($booleanKeys as $key) {
            if (array_key_exists($key, $data)) {
                $types[$key] = 'boolean';
            }
        }

        Setting::setMany($group, $data, $types);

        return $this->index();
    }

    /**
     * Send a live test email using whatever mail settings are currently saved,
     * so an admin can verify SMTP credentials without leaving the settings page.
     */
    public function testMail(Request $request)
    {
        $data = $request->validate(['to' => ['required', 'email']]);

        $mail = Setting::get('mail');
        Config::set('mail.default', $mail['driver'] ?? 'log');

        if (($mail['driver'] ?? 'log') === 'smtp') {
            Config::set('mail.mailers.smtp.host', $mail['host'] ?? null);
            Config::set('mail.mailers.smtp.port', $mail['port'] ?? 587);
            Config::set('mail.mailers.smtp.username', $mail['username'] ?? null);
            Config::set('mail.mailers.smtp.password', $mail['password'] ?? null);
            Config::set('mail.mailers.smtp.encryption', $mail['encryption'] ?: null);
        }

        try {
            Mail::raw(
                "This is a test email from your {$mail['from_name']} store settings. If you received this, outbound mail is configured correctly.",
                fn ($message) => $message->to($data['to'])->subject('KinBech - Test Email')
            );
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Failed to send test email: '.$e->getMessage()], 422);
        }

        return response()->json(['message' => 'Test email sent (check the log file if using the "log" driver).']);
    }
}
