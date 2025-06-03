import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { User, UserInforBirthday } from "@/utils/interfaces/user";
import { UserAbout } from "@/utils/interfaces/user";

export const getUserAbout = async (): Promise<UserAbout> => {
  const response = await axiosInstance.get<ApiResponse<UserAbout>>(
    API_ENDPOINTS.PROFILE.USER_ABOUT
  );
  return response.data.data;
};

export const getUserInforBirthday = async (): Promise<UserInforBirthday> => {
  const response = await axiosInstance.get<ApiResponse<UserInforBirthday>>(
    API_ENDPOINTS.FRIENDS.USER_INFOR_BIRTHDAY
  );
  return response.data.data;
};

export const searchBox = async (keyword: string): Promise<User[]> => {
  const response = await axiosInstance.get<ApiResponse<User[]>>(
    API_ENDPOINTS.FRIENDS.SEARCH_BOX(keyword)
  );
  return response.data.data;
};
