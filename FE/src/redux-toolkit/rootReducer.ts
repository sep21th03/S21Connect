import { combineReducers } from "@reduxjs/toolkit";

import storiesModalSlice from "./reducers/StoriesModalSlice";
import favouritePageSlice from "./reducers/FavouritePageSlice";
import LayoutSlice from "./reducers/LayoutSlice";
import ShowMorePostSlice from "./reducers/ShowMorePostSlice";
import AuthSlice from "./slice/authSlice";

const rootReducer = combineReducers({
  storiesModalSlice,
  favouritePageSlice,
  LayoutSlice,
  ShowMorePostSlice,
  // Add other slices here
  AuthSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;