<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Medicine extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'manufacturer_distributor',
        'dosage',
        'form',
        'unit_of_measure',
        'reorder_level',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'reorder_level' => 'integer',
        ];
    }

    public function batches()
    {
        return $this->hasMany(Batch::class);
    }

    public function stockLedgerEntries()
    {
        return $this->hasMany(StockLedgerEntry::class);
    }

    public function medicineStockSummaries()
    {
        return $this->hasOne(MedicineStockSummary::class);
    }

    public function getTotalStockAttribute(): int
    {
        return MedicineStockSummary::where('medicine_id', $this->id)->value('total_quantity_in_stock');
    }

    public function lowStock($query, $threshold = null)
    {
        $threshold = $threshold ?? $this->reorder_level;

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
