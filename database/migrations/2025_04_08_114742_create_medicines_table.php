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
            $table->string('generic_name')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('strength')->nullable();
            $table->string('form')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('category_id')->constrained('categories');
            $table->boolean('requires_prescription')->default(false);
            $table->integer('low_stock_threshold')->nullable()->default(10);
            $table->timestamps();

            $table->index('name');
            $table->index('category_id');
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
