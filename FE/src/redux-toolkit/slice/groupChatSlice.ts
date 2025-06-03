import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
}

interface GroupChatState {
  isModalOpen: boolean;
  selectedFriends: Friend[];
  showFriendsList: boolean;
  searchTerm: string;
  groupName: string;
}

const initialState: GroupChatState = {
  isModalOpen: false,
  selectedFriends: [],
  showFriendsList: false,
  searchTerm: '',
  groupName: '',
};

const groupChatSlice = createSlice({
  name: 'groupChat',
  initialState,
  reducers: {
    openModal: (state) => {
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.selectedFriends = [];
      state.showFriendsList = false;
      state.searchTerm = '';
      state.groupName = '';
    },
    toggleFriendsList: (state) => {
      state.showFriendsList = !state.showFriendsList;
    },
    addFriend: (state, action: PayloadAction<Friend>) => {
      const friend = action.payload;
      if (!state.selectedFriends.find(f => f.id === friend.id)) {
        state.selectedFriends.push(friend);
      }
    },
    removeFriend: (state, action: PayloadAction<string>) => {
      state.selectedFriends = state.selectedFriends.filter(
        friend => friend.id !== action.payload
      );
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setGroupName: (state, action: PayloadAction<string>) => {
      state.groupName = action.payload;
    },
  },
});

export const {
  openModal,
  closeModal,
  toggleFriendsList,
  addFriend,
  removeFriend,
  setSearchTerm,
  setGroupName,
} = groupChatSlice.actions;

export default groupChatSlice.reducer;