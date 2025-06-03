import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { User } from "@/utils/interfaces/user";

export const getActivityLogsByUsername = async (username: string, page = 1) => {
  try {
    const response = await axiosInstance.get(
      API_ENDPOINTS.USERS.ACTIVITY_PROFILE(username),
      {
        params: { page },
        timeout: 10000,
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      }
    );

    return response;
  } catch (error: any) {
    console.error("API Error:", error);

    if (error.response) {
      throw new Error(
        `Server error: ${error.response.status} - ${
          error.response.data?.message || "Unknown error"
        }`
      );
    } else if (error.request) {
      throw new Error("Network error: No response from server");
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
};

export async function userProfile() {
  try {
    const res = await axiosInstance.get(API_ENDPOINTS.USERS.PROFILE);

    const data = res.data;
    return data;
  } catch (err) {
    console.error("Error fetching user:", err);
    return null;
  }
}


export const getListFriends = async (userId: string) => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.USERS.BASE + API_ENDPOINTS.USERS.LIST_FRIENDS(userId)
  );
  return response.data;
};

export async function searchFriends(searchTerm: string = ''): Promise<User[]> {
  try {
    const res = await axiosInstance.get(API_ENDPOINTS.USERS.SEARCH_FRIENDS(searchTerm));
    return res.data as User[];
  } catch (error) {
    console.error('Failed to fetch friends:', error);
    throw error;
  }
}