import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LayoutSliceInterFace } from "../ReducersTypes";

interface ExtendedLayoutSliceInterface extends LayoutSliceInterFace {
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  isProfileLoading?: boolean;
  profileError?: string;
  imageLink?: string | null;
  backgroundImage?: string | null;
}

const initialState: ExtendedLayoutSliceInterface = {
  imageLink: null,
  backgroundImage: null,
  userAvatar: undefined,
  userName: undefined,
  userEmail: undefined,
  isProfileLoading: false,
  profileError: undefined,
};

export const LayoutSlice = createSlice({
  name: "LayoutSlice",
  initialState,
  reducers: {
    setImageLink: (state, action: PayloadAction<string>) => {
      state.imageLink = action.payload;
      state.userAvatar = action.payload;
    },
    setBackgroundImage: (state, action: PayloadAction<string>) => {
      state.backgroundImage = action.payload;
    },
    setUserAvatar: (state, action: PayloadAction<string>) => {
      state.userAvatar = action.payload;
      state.imageLink = action.payload;
    },
    setUserInfo: (state, action: PayloadAction<{
      name?: string;
      email?: string;
      avatar?: string;
    }>) => {
      const { name, email, avatar } = action.payload;
      if (name) state.userName = name;
      if (email) state.userEmail = email;
      if (avatar) {
        state.userAvatar = avatar;
        state.imageLink = avatar;
      }
    },
    setProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.isProfileLoading = action.payload;
      if (action.payload) {
        state.profileError = undefined;
      }
    },
    setProfileError: (state, action: PayloadAction<string>) => {
      state.profileError = action.payload;
      state.isProfileLoading = false;
    },
    clearProfileError: (state) => {
      state.profileError = undefined;
    },
    resetUserData: (state) => {
      state.userAvatar = undefined;
      state.userName = undefined;
      state.userEmail = undefined;
      state.isProfileLoading = false;
      state.profileError = undefined;
      state.imageLink = "user-sm/15.jpg";
      state.backgroundImage = "istockphoto-1370544962-612x612.jpg";
    }
  },
});

export const { 
  setImageLink,
  setBackgroundImage,
  setUserAvatar,
  setUserInfo,
  setProfileLoading,
  setProfileError,
  clearProfileError,
  resetUserData
} = LayoutSlice.actions;

export default LayoutSlice.reducer;