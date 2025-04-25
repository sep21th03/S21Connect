import {
  createAction,
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from "@reduxjs/toolkit";
import type { User } from "@/utils/interfaces/user";
import Cookies from "js-cookie";
import { signIn, signOut } from "next-auth/react";
import { getSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";

// export const setSocketConnection = createAction<Socket>(
//   "auth/setSocketConnection"
// );
// export const updateOnlineUsers = createAction<any[]>("user/updateOnlineUsers");
// export const updateUserStatus = createAction<{
//   userId: string;
//   status: string;
//   username: string;
// }>("user/updateUserStatus");

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
  Cookies.set(TOKEN_COOKIE_NAME, token, { expires: COOKIE_EXPIRES });
};

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
      return rejectWithValue(result.error || "Đăng nhập thất bại");
    }

    if (result?.ok) {
      const session = await getSession();
      const token = (session as any)?.token;

      if (token) {
        saveTokenToCookies(token);

        // if (socket) socket.disconnect();

        // socket = io("http://localhost:3001", {
        //   auth: { token },
        //   reconnection: true,
        //   reconnectionAttempts: 5,
        // });

        // socket.on("online_users_list", (users) => {
        //   console.log("Online users:", users);
        //   dispatch(updateOnlineUsers(users));
        // });

        // socket.on("user_status_changed", (data) => {
        //   console.log("User status changed:", data);
        //   dispatch(updateUserStatus(data));
        // });

        // socket.emit("get_online_users");

        // // Xử lý lỗi kết nối
        // socket.on("connect_error", (error) => {
        //   console.log("Socket connection error:", error);
        //   toast?.error?.("Không thể kết nối đến máy chủ real-time");
        // });

        // // Lưu socket vào redux state
        // dispatch(setSocketConnection(socket));
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

      // Xóa token cookie
      removeTokenFromCookies();

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
    // setSocket: (state, action: PayloadAction<Socket | null>) => {
    //   state.socket = action.payload as any; // Type assertion to bypass readonly issue
    // },
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
      // .addCase(setSocketConnection, (state, action) => {
      //   state.socket = action.payload as any;
      // })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        // state.socket = null;
      });
  },
});
export const { clearError, setAuthenticated } = authSlice.actions;
export default authSlice.reducer;
