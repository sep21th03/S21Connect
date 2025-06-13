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
        Schema::create('page_reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->unsignedBigInteger('post_id')->unique();

            $table->uuid('page_id');
            $table->uuid('user_id');

            $table->tinyInteger('rate')->comment('1 đến 5 sao');

            $table->integer('helpful_count')->default(0);

            $table->timestamps();

            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            $table->foreign('page_id')->references('id')->on('pages')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->unique(['page_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_reviews');
    }
};
