<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Batch extends Model
{

    use HasFactory;

    protected $fillable = [
        'batch_number',
        'medicine_id',
        'supplier_id',
        'quantity_received',
        'current_quantity',
        'manufacture_date',	
        'expiry_date',
    ];

    protected function casts(): array
    {
        return [
            'expiry_date' => 'date',
            'manufacture_date' => 'date',
        ];
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function expiringSoon($query,$days = 30)
    {
        return $query->where('expiry_date', '<=', now()->addDays($days));
    }

    public function expired($query)
    {
        return $query->where('expiry_date', '<', now());
    }

    public function inStock($query)
    {
        return $query->where('current_quantity', '>', 0);
    }
}
