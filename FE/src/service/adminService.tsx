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

  fetchStats: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_STATS);
      return response.data || null;
    } catch (error) {
      console.error("Error fetching stats:", error);
      return null;
    }
  },

  getActiveUsersByDate: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.ADMIN.GET_ACTIVE_USERS_BY_DATE
      );
      return response.data || null;
    } catch (error) {
      console.error("Error fetching active users by date:", error);
      return null;
    }
  },

  getUserDistribution: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.ADMIN.GET_USER_DISTRIBUTION
      );
      return response.data || null;
    } catch (error) {
      console.error("Error fetching user distribution:", error);
      return null;
    }
  },

  getSupportRequests: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.ADMIN.GET_SUPPORT_REQUESTS
      );
      return response.data || null;
    } catch (error) {
      console.error("Error fetching support requests:", error);
      return null;
    }
  },

  getReportsByCategory: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.ADMIN.GET_REPORTS_BY_CATEGORY
      );
      return response.data || null;
    } catch (error) {
      console.error("Error fetching reports by category:", error);
      return null;
    }
  },

  getDashboardData: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.ADMIN.GET_DASHBOARD_DATA
      );
      return response.data || null;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return null;
    }
  },

  updateUserStatus: async (userId: string, status: string): Promise<void> => {
    try {
      await axiosInstance.post(
        API_ENDPOINTS.ADMIN.USERS.UPDATE_STATUS(userId),
        { status }
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      throw error;
    }
  },

  fetchReports: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.ADMIN.REPORTS
      );
      return response.data || null;
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      throw error;
    }
  },
};
