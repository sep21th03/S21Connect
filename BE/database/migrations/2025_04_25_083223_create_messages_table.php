<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->uuid('id')->primary(); // UUID cho id
            $table->uuid('sender_id');
            $table->uuid('receiver_id')->nullable(); // nullable nếu là group message
            $table->uuid('group_id')->nullable(); // nullable nếu là message 1-1
        
            $table->text('content')->nullable();
            $table->enum('type', ['text', 'image', 'video', 'sticker', 'file'])->default('text');
            $table->text('file_paths')->nullable();
        
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
        
            $table->timestamps();
        
            // Foreign keys
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('receiver_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('group_id')->references('id')->on('chat_groups')->onDelete('cascade');
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
