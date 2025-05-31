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

export async function createPost(
  feeling: string,
  checkin: string | null,
  tagfriends: string[],
  bg_id: string,
  content: string,
  visibility: string,
  images: string[],
  videos: string[]
) {
  const response = await axiosInstance.post(API_ENDPOINTS.POSTS.CREATE_POST, {
    feeling,
    checkin,
    tagfriends,
    bg_id,
    content,
    visibility,
    images,
    videos
  });

  return response;
}


export async function sharePost(postId: number, visibility: string, content: string) {
  const response = await axiosInstance.post(API_ENDPOINTS.POSTS.SHARES.SHARE, {
    post_id: postId,
    visibility,
    content
  });

  return response;
}
