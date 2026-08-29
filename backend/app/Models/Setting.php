<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class Setting extends Model
{
    protected $fillable = ['group', 'key', 'value', 'type'];

    public const CACHE_KEY = 'kinbech.settings';

    /**
     * Get every setting as a nested [group => [key => value]] array, cast to native types.
     */
    public static function allGrouped(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            $grouped = [];

            foreach (self::all() as $setting) {
                $grouped[$setting->group][$setting->key] = self::castValue($setting->type, $setting->value);
            }

            return $grouped;
        });
    }

    /**
     * Get a single setting value using "group.key" dot notation, with a default fallback.
     */
    public static function get(string $dotKey, mixed $default = null): mixed
    {
        [$group, $key] = array_pad(explode('.', $dotKey, 2), 2, null);

        return data_get(self::allGrouped(), "{$group}.{$key}", $default);
    }

    /**
     * Persist one setting and bust the settings cache.
     */
    public static function set(string $group, string $key, mixed $value, string $type = 'string'): void
    {
        self::updateOrCreate(
            ['group' => $group, 'key' => $key],
            ['value' => self::prepareValue($type, $value), 'type' => $type]
        );

        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Persist many settings for a group at once (used by admin settings forms).
     */
    public static function setMany(string $group, array $values, array $types = []): void
    {
        foreach ($values as $key => $value) {
            self::set($group, $key, $value, $types[$key] ?? 'string');
        }
    }

    protected static function castValue(string $type, ?string $value): mixed
    {
        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'float' => (float) $value,
            'json' => $value ? json_decode($value, true) : null,
            'encrypted' => $value ? Crypt::decryptString($value) : null,
            default => $value,
        };
    }

    protected static function prepareValue(string $type, mixed $value): ?string
    {
        return match ($type) {
            'boolean' => $value ? '1' : '0',
            'json' => $value !== null ? json_encode($value) : null,
            'encrypted' => $value !== null && $value !== '' ? Crypt::encryptString($value) : null,
            default => $value === null ? null : (string) $value,
        };
    }
}
