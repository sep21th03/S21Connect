import { UserRedux } from "@/utils/interfaces/user";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface UserState {
  user: UserRedux | null;
}

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserRedux>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
    updateUser: (state, action: PayloadAction<Partial<UserRedux>>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },
  },
});

export const { setUser, clearUser, updateUser } = userSlice.actions;
export default userSlice.reducer;
