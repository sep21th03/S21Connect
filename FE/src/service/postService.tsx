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
type MediaItem = {
  url: string;
  public_id: string;
  type: "image" | "video";
};
export async function createPost(
  feeling: string,
  checkin: string | null,
  tagfriends: string[],
  bg_id: string,
  content: string,
  visibility: string,
  media: MediaItem[]
) {
  const response = await axiosInstance.post(API_ENDPOINTS.POSTS.CREATE_POST, {
    feeling,
    checkin,
    tagfriends,
    bg_id,
    content,
    visibility,
    media
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


interface PagePostData {
  content: string;
  feeling?: string;
  checkin?: any;
  tagfriends?: string[];
  bg_id?: string;
  visibility: string;
  media?: Array<{
    url: string;
    public_id: string;
    type: "image" | "video";
  }>;
}


export const createPagePost = async (
  pageId: string,
  feeling?: string,
  checkin?: any,
  tagfriends?: string[],
  bg_id?: string,
  content?: string,
  visibility?: string,
  media?: Array<{
    url: string;
    public_id: string;
    type: "image" | "video";
  }>
) => {
  try {
    const postData: PagePostData = {
      content: content || "",
      feeling,
      checkin,
      tagfriends,
      bg_id,
      visibility: visibility || "public",
      media,
    };

    const response = await axiosInstance.post(
      API_ENDPOINTS.POSTS.PAGES.CREATE_PAGE_POST(pageId),
      postData
    );

    return response;
  } catch (error) {
    console.error("Error creating page post:", error);
    throw error;
  }
};

export const getPagePosts = async (
  pageId: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response = await axiosInstance.get(
      API_ENDPOINTS.POSTS.PAGES.GET_PAGE_POSTS(pageId),
      {
        params: {
          page,
          limit,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching page posts:", error);
    throw error;
  }
};

export const getMyPagesPosts = async (
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response = await axiosInstance.get(
      API_ENDPOINTS.POSTS.PAGES.GET_MY_PAGES_POSTS, 
      {
        params: {
          page,
          limit,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching my pages posts:", error);
    throw error;
  }
};

export const checkPagePermission = async (pageId: string) => {
  try {
    const response = await axiosInstance.get(
      API_ENDPOINTS.POSTS.PAGES.CHECK_PERMISSION(pageId)
    );

    return response.data;
  } catch (error) {
    console.error("Error checking page permission:", error);
    throw error;
  }
};

export const getPageInfo = async (pageId: string) => {
  try {
    const response = await axiosInstance.get(
      API_ENDPOINTS.POSTS.PAGES.GET_PAGE_POSTS(pageId)
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching page info:", error);
    throw error;
  }
};