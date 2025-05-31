import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";


export const sendMessage = async (payload: any) => {
    const response = await axiosInstance.post(API_ENDPOINTS.MESSAGES.MESSAGES.BASE + API_ENDPOINTS.MESSAGES.MESSAGES.SEND_MESSAGE, payload);
    return response.data;
  };
  