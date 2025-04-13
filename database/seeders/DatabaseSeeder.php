<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Roles
        DB::table('roles')->insert([
            [
                'name' => 'superadmin',
                'description' => 'Super Admin',
            ],
            [
                'name' => 'admin',
                'description' => 'Admin',
            ],
            [
                'name' => 'user',
                'description' => 'User',
            ],
        ]);

        // Users
        DB::table('users')->insert([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role_id' => 1,
        ]);

        // Categories
        DB::table('categories')->insert([
            'name' => 'Test Category',
            'description' => 'This is a test category.',
        ]);

        // Suppliers
        DB::table('suppliers')->insert([
            [
                'name' => 'Test Supplier',
                'contact_person' => 'Test Contact Person',
                'phone' => '1234567890',
                'email' => 'test@example.com',
                'address' => 'Test Address',
            ],
            [
                'name' => 'Test Supplier 2',
                'contact_person' => 'Test Contact Person 2',
                'phone' => '9876543210',
                'email' => 'test2@example.com',
                'address' => 'Test Address 2',
            ],
        ]);

        // Sales
        DB::table('sales')->insert([
            [
                'sale_date' => now(),
                'total_amount' => 100.00,
                'user_id' => 1,
                'customer_name' => 'John Doe',
                'payment_method' => 'Cash',
                'prescription_reference' => 'RX-12345',
                'notes' => 'Test sale note',
            ],
            [
                'sale_date' => now(),
                'total_amount' => 200.00,
                'user_id' => 1,
                'customer_name' => 'Jane Doe',
                'payment_method' => 'Credit Card',
                'prescription_reference' => 'RX-12346',
                'notes' => 'Test sale note 2',
            ],
        ]);

        // Medicines
        DB::table('medicines')->insert([
            [
                'name' => 'Paracetamol',
                'generic_name' => 'Acetaminophen',
                'manufacturer' => 'Generic Pharma',
                'strength' => '500mg',
                'form' => 'Tablet',
                'description' => 'Pain reliever and fever reducer',
                'category_id' => 1,
                'requires_prescription' => false,
                'low_stock_threshold' => 20,
            ],
            [
                'name' => 'Amoxicillin',
                'generic_name' => 'Amoxicillin',
                'manufacturer' => 'Med Labs',
                'strength' => '250mg',
                'form' => 'Capsule',
                'description' => 'Antibiotic for bacterial infections',
                'category_id' => 1,
                'requires_prescription' => true,
                'low_stock_threshold' => 15,
            ],
        ]);

        // Batches
        DB::table('batches')->insert([
            [
                'medicine_id' => 1,
                'supplier_id' => 1,
                'batch_number' => 'B001',
                'quantity_received' => 100,
                'current_quantity' => 98,
                'cost_price' => 40.00,
                'selling_price' => 50.00,
                'manufacture_date' => now()->subMonths(1),
                'expiry_date' => now()->addYears(2),
            ],
            [
                'medicine_id' => 2,
                'supplier_id' => 2,
                'batch_number' => 'B002',
                'quantity_received' => 50,
                'current_quantity' => 49,
                'cost_price' => 150.00,
                'selling_price' => 200.00,
                'manufacture_date' => now()->subMonths(2),
                'expiry_date' => now()->addYears(1),
            ],
        ]);

        // Sale Items
        DB::table('sale_items')->insert([
            [
                'sale_id' => 1,
                'batch_id' => 1,
                'quantity_sold' => 2,
                'price_per_unit' => 50.00,
                'total_price' => 100.00,
            ],
            [
                'sale_id' => 2,
                'batch_id' => 2,
                'quantity_sold' => 1,
                'price_per_unit' => 200.00,
                'total_price' => 200.00,
            ],
        ]);

        // Notifications
        DB::table('notifications')->insert([
            [
                'id' => Str::uuid(),
                'type' => 'App\Notifications\LowStockAlert',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => 1,
                'data' => json_encode([
                    'message' => 'Low stock alert for Paracetamol',
                    'medicine_id' => 1
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => Str::uuid(),
                'type' => 'App\Notifications\ExpiryAlert',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => 1,
                'data' => json_encode([
                    'message' => 'Expiry alert for Amoxicillin',
                    'medicine_id' => 2
                ]),
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
