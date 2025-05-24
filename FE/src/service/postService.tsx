import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";

export async function getPost(
  postId: string,
  commentId?: string,
  replyCommentId?: string,
  reactionId?: string,
  notificationId?: string
) {
  const response = await axiosInstance.get(
    API_ENDPOINTS.POSTS.SHOW_POST(
      postId,
      commentId,
      replyCommentId,
      reactionId,
      notificationId
    )
  );

  return response.data;
}
