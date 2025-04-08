<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    protected $fillable = [
        'medication_id',
        'quantity',
        'start_time',
        'end_time',
        'notes',
        'created_by',
    ];

    public function medication()
    {
        return $this->belongsTo(Medication::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
