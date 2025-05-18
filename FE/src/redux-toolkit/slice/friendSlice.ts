import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FriendData {
  id: string;
  mutual_friends_count: number;
  name?: string;
  username?: string;
  avatar?: string;
  other_user: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
}

interface FriendState {
  friends: FriendData[];
  lastFetched: number | null;
}

const initialState: FriendState = {
  friends: [],
  lastFetched: null,
};

const friendSlice = createSlice({
  name: "friend",
  initialState,
  reducers: {
    setFriends(state, action: PayloadAction<FriendData[]>) {
      state.friends = action.payload;
      state.lastFetched = Date.now();
    },
    addFriend(state, action: PayloadAction<FriendData>) {
      state.friends.push(action.payload);
    },
    clearFriends(state) {
      state.friends = [];
      state.lastFetched = null;
    },
  },
});

export const { setFriends, addFriend, clearFriends } = friendSlice.actions;
export default friendSlice.reducer;
