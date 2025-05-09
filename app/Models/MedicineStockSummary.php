<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicineStockSummary extends Model
{
    use HasFactory;

    protected $table = 'medicine_stock_summaries';

    protected $fillable = [
        'medicine_id',
        'total_quantity_in_stock',
        'last_updated_at',
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}
