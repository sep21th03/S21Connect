// services/imageService.ts
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface UpdateAvatarResponse {
  success: boolean;
  message: string;
  avatar?: string;
}

export interface UpdateBackgroundResponse {
  success: boolean;
  message: string;
  cover_photo?: string;
}

class UserProfileService {
  async updateAvatar(
    avatar: string
  ): Promise<UpdateAvatarResponse> {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.PROFILE.USER_AVATAR,
        { avatar }
      );
      return {
        success: true,
        message: "Cập nhật ảnh đại diện thành công",
        avatar: response.data.avatar
      };
    } catch (error) {
      console.error("Error updating avatar:", error);
      return {
        success: false,
        message: "Failed to update avatar",
      };
    }
  }

  async getUserData(userId: string): Promise<any> {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.PROFILE.USER_DATA(userId)
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  }

  async updateProfile(profileData: any): Promise<UpdateProfileResponse> {
    try {
      const payload = {
        profile: {
          ...profileData,
          is_phone_number_visible: profileData.is_phone_number_visible ? 1 : 0,
          is_location_visible: profileData.is_location_visible ? 1 : 0,
          is_workplace_visible: profileData.is_workplace_visible ? 1 : 0,
          is_school_visible: profileData.is_school_visible ? 1 : 0,
          is_past_school_visible: profileData.is_past_school_visible ? 1 : 0,
          is_relationship_status_visible:
            profileData.is_relationship_status_visible ? 1 : 0,
        },
      };

      const response = await axiosInstance.patch(
        API_ENDPOINTS.PROFILE.BASE + API_ENDPOINTS.PROFILE.MY_PROFILE.UPDATE,
        payload
      );

      return {
        success: true,
        message: "Cập nhật thông tin thành công",
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error updating profile:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Cập nhật thông tin thất bại",
      };
    }
  }
  async updateBackgroundImage(imageUrl: string): Promise<UpdateBackgroundResponse> {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.PROFILE.UPDATE_BACKGROUND,
        { cover_photo: imageUrl }
      );
      return {
        success: true,
        message: "Cập nhật ảnh bìa thành công",
        cover_photo: response.data.cover_photo
      };
    } catch (error: any) {
      console.error("Error updating background image:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Cập nhật ảnh bìa thất bại",
      };
    }
  }
  
}

export default new UserProfileService();
