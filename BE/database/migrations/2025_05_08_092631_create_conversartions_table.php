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
        // Create conversations table
        Schema::create('conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->nullable(); // Name for group conversations
            $table->enum('type', ['private', 'group'])->default('private');
            $table->uuid('image_id')->nullable(); // Avatar for the conversation
            $table->timestamps();
            
            // Foreign key for the image
            $table->foreign('image_id')->references('id')->on('images')->onDelete('set null');
        });
        
        // Create conversation_user pivot table for participants
        Schema::create('conversation_user', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('conversation_id');
            $table->uuid('user_id');
            $table->string('nickname')->nullable(); // Custom nickname for user in this conversation
            $table->timestamp('last_read_at')->nullable();
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Ensure a user can only be in a conversation once
            $table->unique(['conversation_id', 'user_id']);
        });
        
        // Modify the messages table to use conversation_id
        Schema::table('messages', function (Blueprint $table) {
            // Add conversation_id column
            $table->uuid('conversation_id')->after('receiver_id');
            
            // Add foreign key
            $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('cascade');
            
            // Drop old group_id column - we'll migrate data first in a separate migration
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
        // Remove the conversation_id column from messages
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['conversation_id']);
            $table->dropColumn('conversation_id');
        });
        
        // Drop the conversation_user table
        Schema::dropIfExists('conversation_user');
        
        // Drop the conversations table
        Schema::dropIfExists('conversations');
    }
};
