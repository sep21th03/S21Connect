import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";


export interface FriendshipResponse {
  status: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
}

class FriendService {
  private async request(
    method: "get" | "post" | "delete",
    url: string
  ): Promise<any> {
    try {
      const response = await axiosInstance[method](url);
      return method === "get" ? response.data : true;
    } catch (error) {
      console.error(`Error during ${method.toUpperCase()} ${url}:`, error);
      return method === "get" ? { status: "none" } : false;
    }
  }

  async checkFriendshipStatus(userId: string): Promise<string> {
    const res = await this.request("get", API_ENDPOINTS.FRIENDS.BASE + API_ENDPOINTS.FRIENDS.CHECK_STATUS(userId));
    return res.status || "none";
  }

  async sendFriendRequest(userId: string) {
    return this.request("post", API_ENDPOINTS.FRIENDS.BASE + API_ENDPOINTS.FRIENDS.SEND(userId));
  }

  async cancelFriendRequest(userId: string) {
    return this.request("delete", API_ENDPOINTS.FRIENDS.BASE + API_ENDPOINTS.FRIENDS.REJECT(userId));
  }

  async acceptFriendRequest(userId: string) {
    return this.request("post", API_ENDPOINTS.FRIENDS.BASE + API_ENDPOINTS.FRIENDS.ACCEPT(userId));
  }

  async unfriend(userId: string) {
    return this.request("delete", API_ENDPOINTS.FRIENDS.BASE + API_ENDPOINTS.FRIENDS.UNFRIEND(userId));
  }
}


export default new FriendService();