<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'user_id',
        'customer_name',
        'total_amount',
        'sale_date',
        'payment_method',
        'prescription_reference',
        'notes'
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'sale_date' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }
}
