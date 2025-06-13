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
  link?: string;
  phone?: string;
  email?: string;
  type?: string;
  created_at?: string;
  creator: {
    id: string;
    name: string;
  };
  admins?: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    role: string;
  }[];
  posts_count: number;
}

export interface PageData {
  name: string;
  slug?: string;
  description?: string;
  avatar?: string;
  cover_image?: string;
  type?: string;
  email?: string;
  phone?: string;
  link?: string;
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
  }

  async getPageFollows(): Promise<any[]> {
    const response = await axiosInstance.get(
      API_ENDPOINTS.FANPAGE.GET_PAGE_FOLLOWS
    );
    return response.data.data;
  }

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
  }

  async getPageBySlug(slug: string): Promise<Page> {
    const response = await axiosInstance.get(
      API_ENDPOINTS.FANPAGE.GET_PAGE_BY_SLUG(slug)
    );
    return response.data;
  }

  async followPage(pageId: string): Promise<boolean> {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.FANPAGE.FOLLOW_PAGE(pageId)
      );
      return response.status === 200;
    } catch (error) {
      console.error("Error following page:", error);
      return false;
    }
  }

  async unfollowPage(pageId: string): Promise<boolean> {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.FANPAGE.UNFOLLOW_PAGE(pageId)
      );
      return response.status === 200;
    } catch (error) {
      console.error("Error unfollowing page:", error);
      return false;
    }
  }

  async checkFollowStatus(pageId: string): Promise<boolean> {
    const response = await axiosInstance.get(
      API_ENDPOINTS.FANPAGE.CHECK_FOLLOW_PAGE(pageId)
    );
    return response.data.is_following;
  };

  async getPageAlbum(pageId: string): Promise<any[]> {
    const response = await axiosInstance.get(
      API_ENDPOINTS.FANPAGE.GET_PAGE_ALBUM(pageId)
    );
    return response.data.data;
  }

  async storeReview(pageId: string, data: any): Promise<any[]> {
    const response = await axiosInstance.post(
      API_ENDPOINTS.FANPAGE.STORE_REVIEW(pageId),
      data
    );
    return response.data.data;
  }

  async getPageReview(pageId: string): Promise<any[]> {
    const response = await axiosInstance.get(
      API_ENDPOINTS.FANPAGE.GET_PAGE_REVIEW(pageId)
    );
    return response.data.data;
  }
}

export default new FanpageService();
