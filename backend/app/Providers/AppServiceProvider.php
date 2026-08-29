<?php

namespace App\Providers;

use App\Models\Setting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

        // Super Admin can do anything - bypasses every explicit permission check.
        Gate::before(function ($user, $ability) {
            return $user->hasRole('Super Admin') ? true : null;
        });

        $this->applyDynamicMailSettings();
    }

    /**
     * Admins can configure outbound mail (SMTP host/port/credentials, from
     * address) from the Settings screen instead of editing .env by hand.
     * We overlay those DB-stored values onto the mail config at boot time,
     * before any mail is dispatched, so changes take effect immediately.
     */
    protected function applyDynamicMailSettings(): void
    {
        try {
            if (! Schema::hasTable('settings')) {
                return;
            }
        } catch (\Throwable) {
            return;
        }

        $mail = Setting::get('mail');

        if (empty($mail) || empty($mail['driver'])) {
            return;
        }

        Config::set('mail.default', $mail['driver']);

        if ($mail['driver'] === 'smtp') {
            Config::set('mail.mailers.smtp.host', $mail['host'] ?? null);
            Config::set('mail.mailers.smtp.port', $mail['port'] ?? 587);
            Config::set('mail.mailers.smtp.username', $mail['username'] ?? null);
            Config::set('mail.mailers.smtp.password', $mail['password'] ?? null);
            Config::set('mail.mailers.smtp.encryption', $mail['encryption'] ?: null);
        }

        if (! empty($mail['from_address'])) {
            Config::set('mail.from.address', $mail['from_address']);
            Config::set('mail.from.name', $mail['from_name'] ?? config('app.name'));
        }
    }
}
