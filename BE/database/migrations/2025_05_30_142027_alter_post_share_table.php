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
        Schema::table('posts', function (Blueprint $table) {
            $table->foreignId('original_post_id')->nullable()->constrained('posts')->nullOnDelete();
            $table->enum('post_format', ['normal', 'shared', 'ads'])->default('normal')->after('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropForeign(['original_post_id']);
            $table->dropColumn(['original_post_id', 'post_format']);
        });
    }
};
