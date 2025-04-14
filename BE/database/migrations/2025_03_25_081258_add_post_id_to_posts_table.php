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
        Schema::table('posts', function (Blueprint $table) {
            $table->string('post_id', 50)->unique()->after('id'); // Mã duy nhất cho bài viết
        });
    }
    
    public function down() {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn('post_id');
        });
    }
    
};
