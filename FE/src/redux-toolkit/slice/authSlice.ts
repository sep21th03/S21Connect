import {
  createAction,
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import type { User, UserRedux } from "@/utils/interfaces/user";
import Cookies from "js-cookie";
import { signIn, signOut } from "next-auth/react";
import { getSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import { setUser, clearUser } from "./userSlice";


let socket: Socket | null = null;

const TOKEN_COOKIE_NAME = "auth_token";
const COOKIE_EXPIRES = 7;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  // socket: Socket | null;
}

const hasToken = !!Cookies.get(TOKEN_COOKIE_NAME);

const initialState: AuthState = {
  user: null,
  isAuthenticated: hasToken,
  loading: false,
  error: null,
  // socket: null,
};

interface LoginCredentials {
  email: string;
  password: string;
  callbackUrl?: string;
}

const saveTokenToCookies = (token: string) => {
  Cookies.set(TOKEN_COOKIE_NAME, token, {
    expires: COOKIE_EXPIRES,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? 'sep21th03.tech' : 'localhost',
  });
};


export { saveTokenToCookies };

export const removeTokenFromCookies = () => {
  Cookies.remove(TOKEN_COOKIE_NAME);
};

export const getAuthToken = () => {
  return Cookies.get(TOKEN_COOKIE_NAME);
};


export const login = createAsyncThunk<
  { success: boolean; url?: string | null },
  LoginCredentials
>("auth/login", async (credentials, { rejectWithValue, dispatch }) => {
  try {
    const result = await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
      callbackUrl: credentials.callbackUrl || "/newsfeed/style2",
    });

    if (result?.error) {
      return rejectWithValue("Đăng nhập thất bại, vui lòng kiểm tra lại thông tin đăng nhập");
    }

    if (result?.ok) {
      const session = await getSession();
      dispatch(setUser(session?.user as unknown as UserRedux));
      const token = (session as any)?.token;
      if (token) {
        saveTokenToCookies(token);
      }
      return { success: true, url: result.url };
    }

    return rejectWithValue("Đăng nhập thất bại. Vui lòng thử lại sau.");
  } catch (error: any) {
    return rejectWithValue(
      error.message || "Đăng nhập thất bại. Vui lòng thử lại sau."
    );
  }
});

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      // Đóng kết nối socket
      if (socket) {
        socket.disconnect();
        socket = null;
      }

      dispatch(clearUser());

      // Xóa token cookie
      removeTokenFromCookies();
      Cookies.remove("next-auth.session-token");
      // Đăng xuất từ next-auth
      await signOut({ redirect: false });

      // Cập nhật state
      dispatch(setAuthenticated(false));

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false };
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
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
      })

      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});
export const { clearError, setAuthenticated } = authSlice.actions;
export default authSlice.reducer;
