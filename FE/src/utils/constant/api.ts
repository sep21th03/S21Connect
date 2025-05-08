export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/email/verify",
    RESEND_VERIFICATION: "/auth/email/resend",
  },

  POSTS: {
    BASE: "/posts",
    TOGGLE_COMMENTS: (id: number | string) => `/posts/${id}/toggle-comments`,
    TOGGLE_REACTIONS: (id: number | string) => `/posts/${id}/toggle-reactions`,
    COMMENTS: {
      ADD: (postId: number | string) => `/posts/${postId}/comments`,
      DELETE: (postId: number | string, commentId: number | string) =>
        `/posts/${postId}/comments/${commentId}`,
    },
    REACTIONS: {
      ADD: (postId: number | string) => `/posts/${postId}/reactions`,
      DELETE: (postId: number | string, reactionId: number | string) =>
        `/posts/${postId}/reactions/${reactionId}`,
    },
    SHARES: {
      CREATE: (postId: number | string) => `/posts/${postId}/shares`,
      GET_ALL: (postId: number | string) => `/posts/${postId}/shares`,
    },
  },

  PROFILE: {
    BASE: "/profile",
    MY_PROFILE: {
      GET: "/me",
      UPDATE: "/me",
      UPDATE_ABOUT: "/about/info",
    },
    USER_PROFILE: (username: string) => `/profile/${username}`,
    USER_DATA: (userId: string) => `/profile/user/data/${userId}`,
    USER_AVATAR: `/profile/user/avatar`,
  },

  FRIENDS: {
    BASE: "/friends",
    SEND: (userId: number | string) => `/request/${userId}`,
    ACCEPT: (userId: number | string) => `/accept/${userId}`,
    REJECT: (userId: number | string) => `/cancel/${userId}`,
    UNFRIEND: (userId: number | string) => `/remove/${userId}`,
    CHECK_STATUS: (userId: number | string) => `/status/${userId}`,
  },

  USERS: {
    BASE: "/user",
    HOVER_CARD: (userId: string) => `/${userId}/hovercard`,
    LIST_FRIENDS: (userId: string) => `/${userId}/list_friends`,
    LIST_FRIENDS_LIMIT: (userId: string) => `/${userId}/list_friends_limit`,
    ONLINE_USERS: (userId: string) => `/${userId}/friends`,
  },

  MESSAGES: {
    MESSAGES: {
      BASE: "/messages",  
      GET_MESSAGES: (Id: string) => `/conversation/${Id}`,
      SEND_MESSAGE: `/send`,
      GET_GROUP_MESSAGES: (groupId: string) => `/group/${groupId}`,
      SEND_GROUP_MESSAGE: (groupId: string) => `/group`,
      RECENT_CONVERSATIONS: "/recent-conversations",
      UNREAD_MESSAGES: "/mark-as-read",
    },
    CHAT_GROUP: {
      BASE: "/chat-groups",
      GET_CHAT_GROUP: (groupId: string) => `/${groupId}`,
    },
  },
  IMAGES: {
    POST_IMAGES: `/images/upload`,
    GET_BY_ID: (id: string) => `/images/${id}`,
    DELETE: (id: string) => `/images/${id}`,
  },
};
