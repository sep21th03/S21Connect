<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up() {
        Schema::create('friendships', function (Blueprint $table) {
            $table->uuid('id')->primary(); 
            $table->uuid('user_id');
            $table->uuid('friend_id');
            $table->enum('status', ['pending', 'accepted', 'none'])->default('none');
            $table->boolean('new')->default(false);
            $table->timestamps();
        
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('friend_id')->references('id')->on('users')->onDelete('cascade');
        
            $table->unique(['user_id', 'friend_id']);
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('friendships');
    }
};
