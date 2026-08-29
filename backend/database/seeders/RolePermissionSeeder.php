<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * The full set of granular admin permissions this app understands.
     * Exposed centrally so the admin "roles & permissions" UI can render
     * a fixed, well-known permission matrix.
     */
    public const PERMISSIONS = [
        'dashboard.view',
        'products.view', 'products.manage',
        'categories.manage',
        'brands.manage',
        'orders.view', 'orders.manage',
        'customers.view', 'customers.manage',
        'coupons.manage',
        'reviews.moderate',
        'messages.manage',
        'admins.manage',
        'settings.manage',
        'reports.view',
    ];

    public function run(): void
    {
        foreach (self::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $superAdmin = Role::findOrCreate('Super Admin', 'web');
        $superAdmin->syncPermissions(self::PERMISSIONS);

        $storeManager = Role::findOrCreate('Store Manager', 'web');
        $storeManager->syncPermissions([
            'dashboard.view', 'products.view', 'products.manage', 'categories.manage', 'brands.manage',
            'orders.view', 'orders.manage', 'customers.view', 'coupons.manage', 'reviews.moderate', 'reports.view',
        ]);

        $supportStaff = Role::findOrCreate('Support Staff', 'web');
        $supportStaff->syncPermissions([
            'dashboard.view', 'orders.view', 'customers.view', 'messages.manage',
        ]);

        $contentEditor = Role::findOrCreate('Content Editor', 'web');
        $contentEditor->syncPermissions([
            'dashboard.view', 'products.view', 'products.manage', 'categories.manage', 'brands.manage', 'reviews.moderate',
        ]);
    }
}
