import { combineReducers } from "@reduxjs/toolkit";

import storiesModalSlice from "./reducers/StoriesModalSlice";
import favouritePageSlice from "./reducers/FavouritePageSlice";
import LayoutSlice from "./reducers/LayoutSlice";
import ShowMorePostSlice from "./reducers/ShowMorePostSlice";
import AuthSlice from "./slice/authSlice";
import ProfileSlice from "./slice/profileSlice";
import FriendSlice from "./slice/friendSlice";
import UserSlice from "./slice/userSlice";
import GroupChatSlice from "./slice/groupChatSlice";

const rootReducer = combineReducers({
  storiesModalSlice,
  favouritePageSlice,
  LayoutSlice,
  ShowMorePostSlice,
  // Add other slices here
  AuthSlice,
  ProfileSlice,
  FriendSlice,
  user: UserSlice,
  groupChat: GroupChatSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;