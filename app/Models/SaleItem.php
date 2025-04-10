<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    protected $fillable = [
        'sale_id',
        'batch_id',
        'quantity_sold',
        'price_per_unit',
        'total_price',
    ];

    protected function casts(): array
    {
        return [
            'price_per_unit' => 'decimal:2',
            'total_price' => 'decimal:2',
        ];
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }
}
