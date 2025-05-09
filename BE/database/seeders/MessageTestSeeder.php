<?php

namespace Database\Seeders;

use App\Models\Messenger;
use App\Models\User;
use App\Models\Conversation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MessageTestSeeder extends Seeder
{
    public function run()
    {
        // Get 3 users for testing
        $users = User::take(3)->get();

        if ($users->count() < 3) {
            $this->command->error('Need at least 3 users for testing');
            return;
        }

        $userA = $users[0];
        $userB = $users[1];
        $userC = $users[2];

        // Create private conversation between A and B
        $privateConversation = Conversation::createPrivateConversation($userA, $userB);

        // Create messages in private conversation
        Messenger::create([
            'sender_id' => $userA->id,
            'receiver_id' => $userB->id,
            'content' => 'Hello from A to B',
            'conversation_id' => $privateConversation->id,
            'type' => 'text',
            'is_read' => false
        ]);

        Messenger::create([
            'sender_id' => $userB->id,
            'receiver_id' => $userA->id,
            'content' => 'Reply from B to A',
            'conversation_id' => $privateConversation->id,
            'type' => 'text',
            'is_read' => false
        ]);

        // Create group conversation
        $groupConversation = Conversation::createGroupConversation(
            'Test Group Chat',
            [$userA->id, $userB->id, $userC->id]
        );

        // Create messages in group conversation
        Messenger::create([
            'sender_id' => $userC->id,
            'group_id' => $groupConversation->id,
            'content' => 'Hello group from C',
            'conversation_id' => $groupConversation->id,
            'type' => 'text',
            'is_read' => false
        ]);

        Messenger::create([
            'sender_id' => $userA->id,
            'group_id' => $groupConversation->id,
            'content' => 'Reply from A in group',
            'conversation_id' => $groupConversation->id,
            'type' => 'text',
            'is_read' => false
        ]);

        $this->command->info('Test data for private and group messages created successfully');
    }
}
