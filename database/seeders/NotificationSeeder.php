<?php

namespace Database\Seeders;

use App\Models\Medicine;
use App\Models\User;
use App\Notifications\ExpiryWarningNotification as ExpiryAlert;
use App\Notifications\LowStockNotification as LowStockAlert;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Only seed notifications in development environment
        if (! app()->environment('local', 'development')) {
            return;
        }

        $user = User::where('email', 'test@example.com')->first();

        // Low stock notification
        $paracetamol = Medicine::where('name', 'Paracetamol')->first();
        $user->notifications()->create([
            'id' => Str::uuid(),
            'type' => LowStockAlert::class,
            'data' => [
                'message' => 'Low stock alert for Paracetamol',
                'medicine_id' => $paracetamol->id,
                'medicine_name' => $paracetamol->name,
                'current_quantity' => 5,
                'threshold' => $paracetamol->reorder_level,
            ],
        ]);

        // Expiry notification
        $amoxicillin = Medicine::where('name', 'Amoxicillin')->first();
        $user->notifications()->create([
            'id' => Str::uuid(),
            'type' => ExpiryAlert::class,
            'data' => [
                'message' => 'Expiry alert for Amoxicillin',
                'medicine_id' => $amoxicillin->id,
                'medicine_name' => $amoxicillin->name,
                'batch_number' => 'AMX-'.date('Ymd').'-001',
                'expiry_date' => Carbon::now()->addDays(30)->format('Y-m-d'),
            ],
        ]);

        // Create some random notifications for other medicines
        Medicine::inRandomOrder()->take(3)->get()->each(function ($medicine) {
            User::inRandomOrder()->first()->notifications()->create([
                'id' => Str::uuid(),
                'type' => rand(0, 1) ? LowStockAlert::class : ExpiryAlert::class,
                'data' => [
                    'message' => rand(0, 1) ?
                        "Low stock alert for {$medicine->name}" :
                        "Expiry alert for {$medicine->name}",
                    'medicine_id' => $medicine->id,
                    'medicine_name' => $medicine->name,
                    'current_quantity' => rand(1, 10),
                    'threshold' => $medicine->reorder_level,
                    'expiry_date' => Carbon::now()->addDays(rand(15, 60))->format('Y-m-d'),
                ],
            ]);
        });
    }
}
