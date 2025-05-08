// src/utils/axiosInstance.ts
import axios from "axios";
import {
  getAuthToken,
  saveTokenToCookies,
  removeTokenFromCookies,
  getRefreshToken,
} from "@/redux-toolkit/slice/authSlice";
import { API_ENDPOINTS } from "./constant/api";

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_NEXTAUTH_API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Cho phép gửi cookies trong mọi request
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        removeTokenFromCookies();
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }
      try {
        // Gọi API refresh token
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_API_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          { refresh_token: refreshToken },
          { withCredentials: true }
        );

        // Lưu token mới
        const newToken = response.data.token;
        saveTokenToCookies(newToken);

        // Thử lại request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Nếu refresh token thất bại, đăng xuất user
        removeTokenFromCookies();
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
