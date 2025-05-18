<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lixi extends Model
{
    protected $table = 'lucky_money';
    public static function getByUsername($username)
    {
        return self::where('username', $username)->get();
    }
    public static function firstbyIDHoadon($bill_id)
    {
        return self::where('bill_id', $bill_id)->first();
    }
    public static function getByIDHoadon($bill_id)
    {
        return self::where('bill_id', $bill_id)->get();
    }
    public static function countAllLixi()
    {
        return self::all()->count();
    }
}
