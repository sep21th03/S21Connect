<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('phone_number')->nullable();
            $table->string('location')->nullable(); 
            $table->string('workplace')->nullable(); 
            $table->string('current_school')->nullable(); 
            $table->string('past_school')->nullable(); 
            $table->enum('relationship_status', [
                'single', 'in_a_relationship', 'engaged', 'married', 
                'complicated', 'separated', 'divorced', 'widowed'
            ])->default('single'); 
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_profiles');
    }
};
