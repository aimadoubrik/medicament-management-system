<?php

namespace Database\Factories;

use App\Models\Category;
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
        $strengths = ['10mg', '20mg', '50mg', '100mg', '250mg', '500mg', '1g', '5ml', '10ml'];

        $medicineName = $this->faker->unique()->word();

        return [
            'name' => ucfirst($medicineName).' '.$this->faker->randomElement($strengths),
            'generic_name' => ucfirst($this->faker->word()),
            'manufacturer' => $this->faker->company(),
            'strength' => $this->faker->randomElement($strengths),
            'form' => $this->faker->randomElement($forms),
            'description' => $this->faker->sentence(),
            'category_id' => Category::inRandomOrder()->first()->id ?? 1,
            'requires_prescription' => $this->faker->boolean(30),
            'low_stock_threshold' => $this->faker->numberBetween(5, 25),
        ];
    }

    /**
     * Indicate that the medicine requires prescription.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function prescription()
    {
        return $this->state(function (array $attributes) {
            return [
                'requires_prescription' => true,
            ];
        });
    }
}
