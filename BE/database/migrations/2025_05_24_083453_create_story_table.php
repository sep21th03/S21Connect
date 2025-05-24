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
        Schema::create('stories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('expires_at');
            $table->timestamps();
        });
        Schema::create('story_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('story_id')->constrained('stories')->onDelete('cascade');
            $table->enum('type', ['image', 'video', 'text', 'image_with_text', 'video_with_text']);
            $table->string('file_url')->nullable(); 
            $table->text('text')->nullable(); 
            $table->json('text_position')->nullable();
            $table->json('text_style')->nullable(); 
            $table->string('background')->nullable(); 
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stories');
        Schema::dropIfExists('story_items');
    }
};
