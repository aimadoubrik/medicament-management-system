<?php

namespace App\Models;

use Illuminate\Bus\Batch;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Supplier extends Model
{

    use HasFactory;

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
