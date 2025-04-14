import { API_ENDPOINTS } from "@/utils/constant/api";
import axiosInstance from "@/utils/axiosInstance";

export const authorize = async (credentials: any) => {
  try {
    console.log("Đang gửi request đến:", API_ENDPOINTS.AUTH.LOGIN);
    
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
      username: credentials.email,
      password: credentials.password,
    });

    console.log("Response từ server:", response.status);
    
    if (response.data && response.data.token) {
      return {
        id: response.data.id || credentials.email,
        name: response.data.name || credentials.email.split('@')[0],
        email: credentials.email,
        token: response.data.token,
      };
    } else {
      console.error("Không có token trong response:", response.data);
      return null;
    }
  } catch (error: any) {
    console.error("Lỗi xác thực:", error.response?.data || error.message);
    return null;
  }
};