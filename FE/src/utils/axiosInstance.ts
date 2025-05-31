// src/utils/axiosInstance.ts
import axios from "axios";
import {
  getAuthToken,
  saveTokenToCookies,
  removeTokenFromCookies,
} from "@/redux-toolkit/slice/authSlice";
import { API_ENDPOINTS } from "./constant/api";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_NEXTAUTH_API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
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

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest._retryRefresh
    ) {
      originalRequest._retry = true;
      const oldToken = getAuthToken();
      if (!oldToken) {
        removeTokenFromCookies();
        signOut();
        return Promise.reject(error);
      }
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_API_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          {},
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${oldToken}`,
            },
          }
        );
        const newToken = response.data.token;
        if (!newToken) throw new Error("No token returned from refresh");

        saveTokenToCookies(newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        originalRequest._retryRefresh = true;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        removeTokenFromCookies();
        signOut();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
