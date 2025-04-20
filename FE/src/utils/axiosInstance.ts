// src/utils/axiosInstance.ts
import axios from "axios";
import { getAuthToken } from "@/redux-toolkit/slice/authSlice";

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


      window.location.href = "/authentication/login";

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
