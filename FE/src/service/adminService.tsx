import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  gender: string | null;
  birthday: string;
  email: string;
  email_verified_at: string | null;
  last_active: string | null;
  avatar: string;
  is_admin: number;
  status: string;
  created_at: string;
}

interface FetchUsersParams {
  page: number;
  search?: string;
  is_admin?: string;
  status?: string;
  min_reports?: string;
}

interface PaginatedResponse {
  data: User[];
  last_page: number;
}

export const adminService = {
  fetchUsers: async ({
    page,
    search,
    is_admin,
    status,
    min_reports,
  }: FetchUsersParams): Promise<PaginatedResponse | null> => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.ADMIN.USERS.GET_USERS,
        {
          params: {
            page,
            search,
            is_admin: is_admin !== "all" ? is_admin : undefined,
            status: status !== "all" ? status : undefined,
            min_reports,
          },
        }
      );
      return response.data || null;
    } catch (error) {
      console.error("Error fetching users:", error);
      return null;
    }
  },

  updateStatus: async (userId: string, status: string): Promise<void> => {
    try {
      await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN.USERS.GET_USERS}/${userId}/status`,
        { status }
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      throw error;
    }
  },

  sendWarning: async (userId: string, message: string): Promise<void> => {
    try {
      await axiosInstance.post(
        `${API_ENDPOINTS.ADMIN.USERS.GET_USERS}/${userId}/warn`,
        { message }
      );
    } catch (error) {
      console.error("Error sending warning:", error);
      throw error;
    }
  },

  deleteUser: async (userId: string): Promise<void> => {
    try {
      await axiosInstance.delete(
        `${API_ENDPOINTS.ADMIN.USERS.GET_USERS}/${userId}`
      );
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
};