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
        Schema::create('images', function (Blueprint $table) {
            $table->uuid('id')->primary(); // UUID cho ảnh
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');

            $table->string('url');         // Link ảnh trên Cloudinary
            $table->string('public_id');   // Dùng để xoá ảnh
            $table->string('folder')->nullable(); // users/username
            $table->string('type')->nullable();   // avatar, post, banner, ...

            $table->integer('width')->nullable();
            $table->integer('height')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('images');
    }
};
