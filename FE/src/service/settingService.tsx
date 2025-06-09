import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";

class SettingService {
  changePassword = async (data: any) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.SETTING.CHANGE_PASSWORD,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  updateProfile = async (data: {
    first_name: string;
    last_name: string;
    birthday: string;
    phonenumber: string;
    gender: string;
  }) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.SETTING.UPDATE_PROFILE,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  getProfile = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.SETTING.GET_PROFILE);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  contactUs = async (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.SETTING.CONTACT_US, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
}

export const settingService = new SettingService();
