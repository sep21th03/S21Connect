import { combineReducers } from "@reduxjs/toolkit";

import storiesModalSlice from "./reducers/StoriesModalSlice";
import favouritePageSlice from "./reducers/FavouritePageSlice";
import LayoutSlice from "./reducers/LayoutSlice";
import ShowMorePostSlice from "./reducers/ShowMorePostSlice";
import AuthSlice from "./slice/authSlice";
import ProfileSlice from "./slice/profileSlice";

const rootReducer = combineReducers({
  storiesModalSlice,
  favouritePageSlice,
  LayoutSlice,
  ShowMorePostSlice,
  // Add other slices here
  AuthSlice,
  ProfileSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;