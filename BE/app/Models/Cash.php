<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cash extends Model
{
    protected $table = 'cash';

    public static function getByUsername($username)
    {
        return self::where('username', $username)->get();
    }

    public static function getPayment()
    {
        return self::all();
    }

    public static function create($username, $account_bank, $account_number, $account_name, $amount)
    {
        $cash = new Cash;
        $cash->username = $username;
        $cash->account_bank = $account_bank;
        $cash->account_number = $account_number;
        $cash->account_name = $account_name;
        $cash->sotien = $amount;
        $cash->status = 0;
        $cash->time = time();
        $cash->save();
        return $cash;
    }

    public static function find($id)
    {
        return self::where('id', $id)->first();
    }

    public static function findbyUsername($username, $id)
    {
        return self::where('username', $username)->where('id', $id)->first();
    }
}
