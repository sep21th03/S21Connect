import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";

export interface Page {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatar?: string;
  cover_image?: string;
  followers_count: number;
  is_followed?: boolean;
  is_admin?: boolean;
  creator: {
    id: string;
    name: string;
  };
}

export interface PageData {
  name: string;
  slug?: string;
  description?: string;
  avatar?: string;
  cover_image?: string;
}

export interface CreatePageResponse {
  success: boolean;
  errors?: Record<string, string>;
}

class FanpageService {
  async fetchPages(type: string): Promise<Page[]> {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.FANPAGE.GET_PAGES,
        {
          params: { type },
        }
      );

      return response.data.data.data || [];
    } catch (error) {
      console.error("Error fetching pages:", error);
      return [];
    }
  };

  async createPage(data: PageData): Promise<CreatePageResponse> {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.FANPAGE.CREATE_PAGE,
        data
      );

      if (response.status === 200) {
        return { success: true };
      } else {
        return {
          success: false,
          errors: { general: "Có lỗi xảy ra" },
        };
      }
    } catch (error) {
      console.error("Error creating page:", error);
      return {
        success: false,
        errors: { general: "Có lỗi xảy ra khi tạo trang" },
      };
    }
  };

  
}

export default new FanpageService();
