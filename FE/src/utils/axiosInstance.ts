// src/utils/axiosInstance.ts
import axios from 'axios';
import { getSession } from 'next-auth/react';


const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_NEXTAUTH_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    
    if (session && (session as any).accessToken) {
      config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
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
      
      window.location.href = '/authentication/login';
      
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;