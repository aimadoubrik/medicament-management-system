<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('manufacturer_distributor')->nullable();
            $table->string('dosage')->nullable();
            $table->string('form')->nullable();
            $table->string('unit_of_measure')->nullable();
            $table->unsignedInteger('reorder_level')->nullable()->default(10);
            $table->text('description')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicines');
    }
};
