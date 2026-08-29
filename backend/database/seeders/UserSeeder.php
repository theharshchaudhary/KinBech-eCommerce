<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = User::updateOrCreate(
            ['email' => 'admin@kinbech.test'],
            [
                'name' => 'KinBech Admin',
                'password' => Hash::make('password'),
                'account_type' => 'staff',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $superAdmin->syncRoles(['Super Admin']);

        $manager = User::updateOrCreate(
            ['email' => 'manager@kinbech.test'],
            [
                'name' => 'Store Manager',
                'password' => Hash::make('password'),
                'account_type' => 'staff',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $manager->syncRoles(['Store Manager']);

        User::updateOrCreate(
            ['email' => 'customer@kinbech.test'],
            [
                'name' => 'Demo Customer',
                'phone' => '9800000000',
                'password' => Hash::make('password'),
                'account_type' => 'customer',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}
