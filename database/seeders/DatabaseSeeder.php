<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            SupplierSeeder::class,
            MedicineSeeder::class,
            BatchSeeder::class,
            NotificationSeeder::class,
            MedicineStockSummarySeeder::class,
            StockLedgerEntrySeeder::class,
        ]);
    }
}
