import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/utils/interfaces/user";
import Cookies from "js-cookie";
import { signIn, signOut } from "next-auth/react";

const TOKEN_COOKIE_NAME = "auth_token";
const COOKIE_EXPIRES = 7;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const hasToken = !!Cookies.get(TOKEN_COOKIE_NAME);

const initialState: AuthState = {
  user: null,
  isAuthenticated: hasToken,
  loading: false,
  error: null,
};

interface LoginCredentials {
    email: string;
    password: string;
    callbackUrl?: string;
  }

interface LoginResponse {
  token: string;
}

const saveTokenToCookies = (token: string) => {
  Cookies.set(TOKEN_COOKIE_NAME, token, { expires: COOKIE_EXPIRES });
};

const removeTokenFromCookies = () => {
  Cookies.remove(TOKEN_COOKIE_NAME);
};

export const getAuthToken = () => {
  return Cookies.get(TOKEN_COOKIE_NAME);
};

export const login = createAsyncThunk<
  { success: boolean; url?: string | null },
  LoginCredentials
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const result = await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
      callbackUrl: credentials.callbackUrl || "/newsfeed/style2",
    });
    console.log("result", result);
    
    if (result?.error) {
      return rejectWithValue(result.error || "Đăng nhập thất bại");
    }

    if (result?.ok) {
      return { success: true, url: result.url };
    }

    return rejectWithValue("Đăng nhập thất bại. Vui lòng thử lại sau.");
  } catch (error: any) {
    return rejectWithValue(
      error.message || "Đăng nhập thất bại. Vui lòng thử lại sau."
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
export const { clearError, setAuthenticated } = authSlice.actions;
export default authSlice.reducer;
