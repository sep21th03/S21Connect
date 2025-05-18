<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Bill extends Model
{
    protected $table = 'bill';
    
    public static function getByOrderCodeAndPaymentLinkId($orderCode, $paymentLinkId)
    {
        return self::where('id', $orderCode)->where('paymentLinkId', $paymentLinkId)->first();
    }
    public static function countallBill()
    {
        return self::all()->count();
    }
    public static function getfirstBill($id_hoadon)
    {
        return self::where('bill_id', $id_hoadon)->first();
    }
    public static function getByUsername($username)
    {
        return self::where('username', $username)->get();
    }
    public static function countBillByUsername($username)
    {
        return self::where('username', $username)->count();
    }
    public static function getByUsernameAndStatus($username, $status)
    {
        return self::where('username', $username)->where('status', $status)->get();
    }
    public static function countBillbyShopid($shopid)
    {
        return self::where('shop_id', $shopid)->count();
    }
    public static function countTotalMoneybyShopid($shopid, $username)
    {
        return self::where('shop_id', $shopid)->where('username', $username)->where('status', 2)->sum('amount');
    }
    public static function countBillbyShopidAndStatusAndUsername($shopid, $status, $username)
    {
        return self::where('shop_id', $shopid)->where('trangthai', $status)->where('username', $username)->count();
    }
    public static function countBillByUsernameAndStatus($username, $status)
    {
        return self::where('username', $username)->where('status', $status)->count();
    }
    public static function getTodayStats($shopId, $username)
    {
        $today = Carbon::today();
        $bills = self::where('shop_id', $shopId)
            ->where('username', $username)
            ->whereDate('created_at', $today)
            ->get();

        $totalMoney = $bills->sum('amount');
        $billCount = $bills->count();

        return [
            'total_money' => $totalMoney,
            'bill_count' => $billCount,
        ];
    }
}
