<?php

namespace App\Http\Controllers\Messenger;

use App\Http\Controllers\Controller;
use App\Models\ChatGroup;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ChatGroupController extends Controller
{
    /**
     * Create a new chat group
     */
    public function create(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'member_ids' => 'sometimes|array',
            'member_ids.*' => 'uuid|exists:users,id'
        ]);
        
        $group = new ChatGroup();
        $group->id = Str::uuid();
        $group->name = $request->name;
        $group->owner_id = Auth::id();
        $group->save();
        
        // Add creator as a member
        $group->users()->attach(Auth::id());
        
        // Add other members if specified
        if ($request->has('member_ids')) {
            $validMemberIds = array_diff($request->member_ids, [Auth::id()]);
            if (!empty($validMemberIds)) {
                $group->users()->attach($validMemberIds);
            }
        }
        
        // Load the members
        $group->load('users:id,username,name');
        
        return response()->json($group, 201);
    }
    
    /**
     * Get group details
     */
    public function show($id)
    {
        $group = ChatGroup::with('users:id,username,name')->findOrFail($id);
        
        // Check if user is a member
        if (!$group->users()->where('user_id', Auth::id())->exists()) {
            return response()->json(['error' => 'You are not a member of this group'], 403);
        }
        
        return response()->json($group);
    }
    
    /**
     * Update group details
     */
    public function update(Request $request, $id)
    {
        $group = ChatGroup::findOrFail($id);
        
        // Only owner can update group details
        if ($group->owner_id !== Auth::id()) {
            return response()->json(['error' => 'Only the group owner can update group details'], 403);
        }
        
        $request->validate([
            'name' => 'sometimes|string|max:255'
        ]);
        
        if ($request->has('name')) {
            $group->name = $request->name;
        }
        
        $group->save();
        
        return response()->json($group);
    }
    
    /**
     * Add members to group
     */
    public function addMembers(Request $request, $id)
    {
        $group = ChatGroup::findOrFail($id);
        
        // Check if user is owner or member
        if (!$group->users()->where('user_id', Auth::id())->exists()) {
            return response()->json(['error' => 'You are not a member of this group'], 403);
        }
        
        $request->validate([
            'member_ids' => 'required|array',
            'member_ids.*' => 'uuid|exists:users,id'
        ]);
        
        // Get existing member IDs
        $existingMemberIds = $group->users()->pluck('user_id')->toArray();
        
        // Filter out members that are already in the group
        $newMemberIds = array_diff($request->member_ids, $existingMemberIds);
        
        if (!empty($newMemberIds)) {
            $group->users()->attach($newMemberIds);
        }
        
        $group->load('users:id,username,name');
        
        return response()->json([
            'success' => true,
            'group' => $group,
            'added_members' => User::whereIn('id', $newMemberIds)->get(['id', 'username', 'name'])
        ]);
    }
    
    /**
     * Remove members from group
     */
    public function removeMembers(Request $request, $id)
    {
        $group = ChatGroup::findOrFail($id);
        
        // Only owner can remove members
        if ($group->owner_id !== Auth::id()) {
            return response()->json(['error' => 'Only the group owner can remove members'], 403);
        }
        
        $request->validate([
            'member_ids' => 'required|array',
            'member_ids.*' => 'uuid|exists:users,id'
        ]);
        
        // Cannot remove the owner
        if (in_array($group->owner_id, $request->member_ids)) {
            return response()->json(['error' => 'Cannot remove the group owner'], 400);
        }
        
        $group->users()->detach($request->member_ids);
        
        $group->load('users:id,username,name');
        
        return response()->json([
            'success' => true,
            'group' => $group,
            'removed_member_ids' => $request->member_ids
        ]);
    }
    
    /**
     * Leave group
     */
    public function leaveGroup($id)
    {
        $group = ChatGroup::findOrFail($id);
        
        // Check if user is a member
        if (!$group->users()->where('user_id', Auth::id())->exists()) {
            return response()->json(['error' => 'You are not a member of this group'], 403);
        }
        
        // If user is the owner, can't leave unless transferring ownership
        if ($group->owner_id === Auth::id()) {
            return response()->json(['error' => 'Owner cannot leave the group. Transfer ownership first.'], 400);
        }
        
        $group->users()->detach(Auth::id());
        
        return response()->json(['success' => true]);
    }
    
    /**
     * Transfer ownership
     */
    public function transferOwnership(Request $request, $id)
    {
        $group = ChatGroup::findOrFail($id);
        
        // Only owner can transfer ownership
        if ($group->owner_id !== Auth::id()) {
            return response()->json(['error' => 'Only the group owner can transfer ownership'], 403);
        }
        
        $request->validate([
            'new_owner_id' => 'required|uuid|exists:users,id'
        ]);
        
        // Ensure new owner is a member
        if (!$group->users()->where('user_id', $request->new_owner_id)->exists()) {
            return response()->json(['error' => 'New owner must be a member of the group'], 400);
        }
        
        $group->owner_id = $request->new_owner_id;
        $group->save();
        
        return response()->json([
            'success' => true,
            'group' => $group->load('users:id,username,name')
        ]);
    }
    
    /**
     * Delete group
     */
    public function delete($id)
    {
        $group = ChatGroup::findOrFail($id);
        
        // Only owner can delete group
        if ($group->owner_id !== Auth::id()) {
            return response()->json(['error' => 'Only the group owner can delete the group'], 403);
        }
        
        // Delete all related data
        $group->users()->detach();
        $group->delete();
        
        return response()->json(['success' => true]);
    }
    
    /**
     * Get user's groups
     */
    public function getUserGroups()
    {
        $groups = Auth::user()->groups()->with('users:id,username,name')->get();
        
        return response()->json($groups);
    }
}