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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('reportable_type'); 
            $table->string('reportable_id');
            $table->uuid('reporter_id');
            $table->string('reason_code');
            $table->text('reason_text')->nullable();
            $table->enum('status', ['pending', 'reviewed', 'rejected', 'responded'])->default('pending');
            $table->text('admin_note')->nullable();
            $table->timestamps();

            $table->foreign('reporter_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
