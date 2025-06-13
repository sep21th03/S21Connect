<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    protected $table = 'shop';
    public static function getByUserandToken($user, $token)
    {
        return self::where('username', $user)->where('token', $token)->first();
    }
    public static function getByID($id)
    {
        return self::where('id', $id)->first();
    }
    public static function getByUsername($username)
    {
        return self::where('username', $username)->get();
    }
    public static function firstShopByUsernameAndName($username, $name)
    {
        return self::where('username', $username)->where('name', $name)->first();
    }
    public static function firstShopByUsernameAndID($username, $id)
    {
        return self::where('username', $username)->where('id', $id)->first();
    }
}
