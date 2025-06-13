import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";

export interface SearchUser {
  type: "user";
  id: string;
  username: string;
  name: string;
  avatar: string | null;
}

export interface SearchPage {
  type: "page";
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
}

export const searchService = {
  searchAll: async (searchTerm: string) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.SEARCH.SEARCH_ALL(searchTerm)
    );
    return response.data;
  },

  advancedSearch: async (keyword: string, filters: any) => {
    try {
      const basicResults = await searchService.searchAll(keyword);

      const transformedData = {
        users: basicResults.users || [],
        posts: [],
        pages: basicResults.pages || [],
        friends: [],
        friendsOfFriends: [],
        strangers: basicResults.users || [],
      };

      if (filters.userType === "friends") {
        transformedData.users = transformedData.users.filter((user: any) => {
          return true;
        });
      }

      return transformedData;
    } catch (error) {
      console.error("Advanced search error:", error);
      return {
        users: [],
        posts: [],
        pages: [],
        friends: [],
        friendsOfFriends: [],
        strangers: [],
      };
    }
  },

  searchUsers: async (searchTerm: string, filters?: any) => {
    const results = await searchService.searchAll(searchTerm);
    return results.users || [];
  },

  searchPages: async (searchTerm: string) => {
    const results = await searchService.searchAll(searchTerm);
    return results.pages || [];
  },

  searchHistory: async () => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.SEARCH.SEARCH_HISTORY
    );
    return response.data;
  },

  saveHistory: async (
    type: "user" | "page" | "none",
    targetId: string,
    keyword: string
  ) => {
    const response = await axiosInstance.post(API_ENDPOINTS.SEARCH.SAVE_SEARCH_HISTORY, {
      type,
      target_id: targetId,
      keyword,
    });
    return response.data;
  },
};
