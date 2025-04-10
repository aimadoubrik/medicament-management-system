<?php

namespace App\Models;

use Illuminate\Bus\Batch;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = [
        'name',
        'address',
        'phone',
        'email',
        'contact_person',
    ];

    public function batches()
    {
        return $this->hasMany(Batch::class);
    }
}
