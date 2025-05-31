<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->nullable();
            $table->enum('type', ['private', 'group'])->default('private');
            $table->uuid('image_id')->nullable(); 
            $table->timestamps();
            
            $table->foreign('image_id')->references('id')->on('images')->onDelete('set null');
        });
        
        Schema::create('conversation_user', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('conversation_id');
            $table->uuid('user_id');
            $table->string('nickname')->nullable();
            $table->timestamp('last_read_at')->nullable();
            $table->timestamps();
            
            $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->unique(['conversation_id', 'user_id']);
        });
        
        Schema::table('messages', function (Blueprint $table) {
            $table->uuid('conversation_id')->after('receiver_id');
            
            $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('cascade');
            
            // $table->dropColumn('group_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['conversation_id']);
            $table->dropColumn('conversation_id');
        });
        
        Schema::dropIfExists('conversation_user');
    
        Schema::dropIfExists('conversations');
    }
};
