<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('vnd')->default('0');
            $table->text('secret_code')->nullable();
        });


        Schema::create('cash', function (Blueprint $table) {
            $table->increments('id');
            $table->text('username');
            $table->text('account_name');
            $table->text('account_bank');
            $table->text('account_number');
            $table->integer('sotien')->nullable();
            $table->text('status');
            $table->text('time');
            $table->timestamps(); 
        });

        Schema::create('history', function (Blueprint $table) {
            $table->increments('id');
            $table->text('username');
            $table->text('message');
            $table->text('time');
            $table->timestamps();
        });

        Schema::create('hoadon', function (Blueprint $table) {
            $table->increments('id');
            $table->text('id_hoadon')->nullable();
            $table->string('username')->default('sep21th03');
            $table->text('sotien')->nullable();
            $table->text('comment')->nullable();
            $table->text('paymentLinkId')->nullable();
            $table->text('payment_method')->nullable();
            $table->text('data_accountNumber')->nullable();
            $table->text('data_accountName')->nullable();
            $table->text('data_description')->nullable();
            $table->text('data_qrCode')->nullable();
            $table->text('data_orderCode')->nullable();
            $table->text('data_sendName')->nullable();
            $table->text('data_sendNumber')->nullable();
            $table->text('signature')->nullable();
            $table->text('return_url')->nullable();
            $table->text('trangthai')->nullable();
            $table->text('shop_id');
            $table->text('time')->nullable();
            $table->timestamps();
        });

        Schema::create('lixi', function (Blueprint $table) {
            $table->increments('id');
            $table->text('id_hoadon')->nullable();
            $table->string('username')->default('sep21th03');
            $table->text('sotien')->nullable();
            $table->text('comment')->nullable();
            $table->text('paymentLinkId')->nullable();
            $table->text('payment_method')->nullable();
            $table->text('data_accountNumber')->nullable();
            $table->text('data_accountName')->nullable();
            $table->text('data_description')->nullable();
            $table->text('data_qrCode')->nullable();
            $table->text('data_orderCode')->nullable();
            $table->text('data_sendName')->nullable();
            $table->text('data_sendNumber')->nullable();
            $table->text('signature')->nullable();
            $table->text('trangthai')->nullable();
            $table->text('time')->nullable();
            $table->timestamps();
        });

        Schema::create('shop', function (Blueprint $table) {
            $table->increments('id');
            $table->text('name');
            $table->text('username');
            $table->text('token');
            $table->text('time');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('cash');
        Schema::dropIfExists('history');
        Schema::dropIfExists('hoadon');
        Schema::dropIfExists('lixi');
        Schema::dropIfExists('shop');
    }
};
