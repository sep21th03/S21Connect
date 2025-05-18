<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class History extends Model
{
    protected $table = 'history';
    
    public static function getByUsername($username)
    {
        return self::where('username', $username)->get();
    }
}
