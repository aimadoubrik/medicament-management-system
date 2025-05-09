<?php

namespace Database\Factories;

use App\Models\Medicine;
use Illuminate\Database\Eloquent\Factories\Factory;

class MedicineFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Medicine::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        $forms = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops'];
        $dosages = ['10mg', '20mg', '50mg', '100mg', '250mg', '500mg', '1g', '5ml', '10ml'];

        $medicineName = $this->faker->unique()->word();

        return [
            'name' => ucfirst($medicineName).' '.$this->faker->randomElement($dosages),
            'manufacturer_distributor' => $this->faker->company(),
            'dosage' => $this->faker->randomElement($dosages),
            'form' => $this->faker->randomElement($forms),
            'unit_of_measure' => $this->faker->randomElement(['mg', 'ml', 'g', 'l']),
            'reorder_level' => $this->faker->numberBetween(5, 25),
            'description' => $this->faker->sentence(),
        ];
    }
}
