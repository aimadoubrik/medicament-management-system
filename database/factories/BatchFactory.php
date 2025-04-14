<?php

namespace Database\Factories;

use App\Models\Batch;
use App\Models\Medicine;
use App\Models\Supplier;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class BatchFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Batch::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition(): array
    {
        $medicine = Medicine::inRandomOrder()->first();
        $supplier = Supplier::inRandomOrder()->first();
        $quantity = $this->faker->numberBetween(30, 200);
        $manufactureDate = Carbon::now()->subMonths($this->faker->numberBetween(1, 6));
        $expiryDate = $manufactureDate->copy()->addYears($this->faker->numberBetween(1, 3));

        // Create a batch number with medicine name prefix and date
        $namePrefix = strtoupper(substr($medicine->name, 0, 3));
        $batchNumber = $namePrefix . '-' . date('Ymd') . '-' . $this->faker->unique()->numberBetween(100, 999);

        return [
            'medicine_id' => $medicine->id,
            'supplier_id' => $supplier->id,
            'batch_number' => $batchNumber,
            'quantity_received' => $quantity,
            'current_quantity' => $this->faker->numberBetween(0, $quantity),
            'manufacture_date' => $manufactureDate,
            'expiry_date' => $expiryDate,
        ];
    }

    /**
     * Indicate that the batch is nearly expired.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function nearlyExpired()
    {
        return $this->state(function (array $attributes) {
            return [
                'expiry_date' => Carbon::now()->addDays($this->faker->numberBetween(30, 90)),
            ];
        });
    }

    /**
     * Indicate that the batch is low on stock.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function lowStock()
    {
        return $this->state(function (array $attributes) {
            $medicine = Medicine::find($attributes['medicine_id']);
            return [
                'current_quantity' => $medicine ? $this->faker->numberBetween(1, $medicine->low_stock_threshold) : 5,
            ];
        });
    }
}
