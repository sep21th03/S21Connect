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
        Schema::table('user_profiles', function (Blueprint $table) {
            // Thêm các cột để xác định trường nào có thể được hiển thị
            $table->boolean('is_phone_number_visible')->default(true);  // Mặc định là hiển thị
            $table->boolean('is_location_visible')->default(true);      // Mặc định là hiển thị
            $table->boolean('is_workplace_visible')->default(true);     // Mặc định là hiển thị
            $table->boolean('is_school_visible')->default(true);        // Mặc định là hiển thị
            $table->boolean('is_past_school_visible')->default(true);   // Mặc định là hiển thị
            $table->boolean('is_relationship_status_visible')->default(true); // Mặc định là hiển thị
        });
    }
    
    public function down()
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            // Nếu cần rollback migration, xóa các cột đã thêm
            $table->dropColumn('is_phone_number_visible');
            $table->dropColumn('is_location_visible');
            $table->dropColumn('is_workplace_visible');
            $table->dropColumn('is_school_visible');
            $table->dropColumn('is_relationship_status_visible');
        });
    }
    
};
