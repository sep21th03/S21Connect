import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { UserProfile, FullUserProfile } from "@/utils/interfaces/user";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS, ApiResponse } from "@/utils/constant/api";

interface ProfileState {
  profile: FullUserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

// Fetch profile thunk
export const fetchProfileAsync = createAsyncThunk(
  "profile/fetchProfile",
  async (username: string) => {
    const response = await axiosInstance.get<ApiResponse<FullUserProfile>>(
      API_ENDPOINTS.PROFILE.USER_PROFILE(username)
    );
    return response.data.data;
  }
);

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (formData: Partial<FullUserProfile>) => {
    const response = await axiosInstance.put<ApiResponse<FullUserProfile>>(
      API_ENDPOINTS.PROFILE.MY_PROFILE.UPDATE,
      formData
    );
    return response.data.data;
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<FullUserProfile>) => {
      state.profile = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfileAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch profile";
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update profile";
      });
  },
});

export const { setProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
