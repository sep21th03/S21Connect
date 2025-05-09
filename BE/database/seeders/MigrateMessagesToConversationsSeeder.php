<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MigrateMessagesToConversationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::beginTransaction();

        try {
            // Step 1: Migrate private conversations
            $this->migratePrivateConversations();

            // Step 2: Migrate group conversations
            $this->migrateGroupConversations();

            DB::commit();
            $this->command->info('Successfully migrated messages to the new conversation system!');
        } catch (\Exception $e) {
            DB::rollback();
            $this->command->error('Migration failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Migrate private conversations
     */
    private function migratePrivateConversations()
    {
        // Find all unique pairs of users in private messages
        $userPairs = DB::table('messages')
            ->whereNotNull('receiver_id')
            ->whereNull('group_id')
            ->select(
                DB::raw('LEAST(sender_id, receiver_id) as user1'),
                DB::raw('GREATEST(sender_id, receiver_id) as user2')
            )
            ->distinct()
            ->get();

        $this->command->info('Found ' . count($userPairs) . ' private conversations to migrate');

        foreach ($userPairs as $pair) {
            // Create a new conversation for this pair
            $conversation = new Conversation();
            $conversation->id = Str::uuid();
            $conversation->type = 'private';
            $conversation->save();

            // Attach users to conversation
            $conversation->users()->attach([
                $pair->user1 => ['id' => Str::uuid()],
                $pair->user2 => ['id' => Str::uuid()]
            ]);

            // Update all messages between these users to use the new conversation_id
            DB::table('messages')
                ->whereNull('group_id')
                ->where(function ($query) use ($pair) {
                    $query->where(function ($q) use ($pair) {
                        $q->where('sender_id', $pair->user1)
                            ->where('receiver_id', $pair->user2);
                    })->orWhere(function ($q) use ($pair) {
                        $q->where('sender_id', $pair->user2)
                            ->where('receiver_id', $pair->user1);
                    });
                })
                ->update(['conversation_id' => $conversation->id]);

            $this->command->info('Migrated conversation between users ' . $pair->user1 . ' and ' . $pair->user2);
        }
    }

    /**
     * Migrate group conversations
     */
    private function migrateGroupConversations()
    {
        // Find all group conversations
        $groups = DB::table('chat_groups')->get();

        $this->command->info('Found ' . count($groups) . ' group conversations to migrate');

        foreach ($groups as $group) {
            // Create a new conversation for this group
            $conversation = new Conversation();
            $conversation->id = Str::uuid();
            $conversation->name = $group->name;
            $conversation->type = 'group';
            $conversation->save();

            // Get all users in this group
            $groupUsers = DB::table('chat_group_user')
                ->where('chat_group_id', $group->id)
                ->get();

            // Attach users to the conversation
            foreach ($groupUsers as $user) {
                $conversation->users()->attach($user->user_id, ['id' => Str::uuid()]);
            }

            // Update all messages for this group to use the new conversation_id
            DB::table('messages')
                ->where('group_id', $group->id)
                ->update(['conversation_id' => $conversation->id]);

            $this->command->info('Migrated group ' . $group->name . ' with ' . count($groupUsers) . ' members');
        }
    }
}