<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockLedgerEntry extends Model
{
    use HasFactory;

    protected $table = 'stock_ledger';

    protected $fillable = [
        'medicine_id',
        'batch_id',
        'transaction_type',
        'quantity_change',
        'quantity_after_transaction',
        'transaction_date',
        'user_id',
        'notes',
        'related_transaction_id',
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
