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
        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medicine_id')->constrained('medicines')->onDelete('restrict');
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('restrict');
            $table->string('batch_number')->nullable();
            $table->unsignedInteger('quantity_received');
            $table->unsignedInteger('current_quantity');
            $table->date('manufacture_date')->nullable();
            $table->date('expiry_date');
            $table->softDeletes();
            $table->timestamps();

            $table->index('expiry_date');
            $table->index('current_quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
