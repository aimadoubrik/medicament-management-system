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
        Schema::create('stock_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medicine_id')->constrained('medicines')->onDelete('restrict');
            $table->foreignId('batch_id')->nullable()->constrained('batches')->onDelete('restrict');
            $table->enum('transaction_type', ['IN_NEW_BATCH', 'OUT_DISPENSE', 'ADJUST_ADD', 'ADJUST_SUB', 'DISPOSAL_EXPIRED', 'DISPOSAL_DAMAGED', 'RETURN_SUPPPLIER', 'INITIAL_STOCK']);
            $table->integer('quantity_change');
            $table->unsignedInteger('quantity_after_transaction');
            $table->timestamp('transaction_date')->useCurrent();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('restrict');
            $table->text('notes')->nullable();
            $table->foreignId('related_transaction_id')->nullable()->constrained('stock_ledger');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_ledger');
    }
};
