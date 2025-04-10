<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'generic_name',
        'manufacturer',
        'strength',
        'form',
        'description',
        'requires_prescription',
        'low_stock_threshold',
        'category_id',
    ];

    protected function casts(): array
    {
        return [
            'requires_prescription' => 'boolean',
            'low_stock_threshold' => 'integer',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function batches()
    {
        return $this->hasMany(Batch::class);
    }

    public function totalStockAttribute()
    {
        return $this->batches()->sum('quantity');
    }
    public function lowStock($query, $threshold = null)
    {
        $threshold = $threshold ?? $this->low_stock_threshold;

        return $query->whereHas('batches', function ($query) use ($threshold) {
            $query->havingRaw('SUM(quantity) < ?', [$threshold]);
        });
    }

    public function expiringSoon($query, $days = 30)
    {
        return $query->whereHas('batches', function ($query) use ($days) {
            $query->where('expiry_date', '<=', now()->addDays($days));
        });
    }
}
