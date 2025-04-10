<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Batch extends Model
{
    protected $fillable = [
        'batch_number',
        'product_id',
        'supplier_id',
        'quantity_received',
        'current_quantity',
        'cost_price',
        'selling_price',
        'manufacture_date',	
        'expiry_date',
    ];

    protected function catsts(): array
    {
        return [
            'expiry_date' => 'date',
            'manufacture_date' => 'date',
            'cost_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
        ];
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
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
