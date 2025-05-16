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
    CREATE_POST: "/posts",
    GET_MY_POSTS: "/posts/my_post",
    EDIT_POST: "/posts/edit",
    GET_POSTS: (username: string) => `/posts/${username}`,
    GET_FRIEND_POSTS: (id: string) => `/posts/get_friend/${id}`,
    GET_NEWSFEED: "/posts/newsfeed",
    TOGGLE_COMMENTS: (id: number | string) => `/posts/${id}/toggle-comments`,
    TOGGLE_REACTIONS: (id: number | string) => `/posts/${id}/toggle-reactions`,
    DELETE_POST: (id: number | string) => `/posts/${id}`,
    COMMENTS: {
      ADD: "/posts/comments/add",
      GET_COMMENTS: (postId: string) => `/posts/comments/${postId}`,
      DELETE: (postId: number | string, commentId: number | string) =>
        `/posts/${postId}/comments/${commentId}`,
    },
    REACTIONS: {
      TOGGLE: (id: number | string) => `/posts/${id}/reactions/toggle`,
      GET: (id: number | string) => `/posts/${id}/reactions/get`
    },
    SHARES: {
      SHARE:  "/posts/shares/post",
      GET_SHARE: (postId: number | string) => `/posts/shares/${postId}`,
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
    USER_ABOUT: "/profile/user/about",
  },

  FRIENDS: {
    BASE: "/friends",
    SEND: (userId: number | string) => `/request/${userId}`,
    ACCEPT: (userId: number | string) => `/accept/${userId}`,
    REJECT: (userId: number | string) => `/cancel/${userId}`,
    UNFRIEND: (userId: number | string) => `/remove/${userId}`,
    CHECK_STATUS: (userId: number | string) => `/status/${userId}`,
    USER_INFOR_BIRTHDAY: "/friends/birthday",
    FRIEND_REQUEST: "/friends/requests",
    FRIEND_REQUEST_COUNT: "/friends/count_new_requests",
  },

  USERS: {
    BASE: "/user",
    HOVER_CARD: (userId: string) => `/${userId}/hovercard`,
    LIST_FRIENDS: (userId: string) => `/${userId}/list_friends`,
    LIST_FRIENDS_LIMIT: (userId: string) => `/${userId}/list_friends_limit`,
    ONLINE_USERS: (userId: string) => `/${userId}/friends`,
    LAST_ACTIVE: (otherUserId: string) => `/user/update-last-active`,
    GET_STATS: "/user/get_stats",
  },

  MESSAGES: {
    MESSAGES: {
      BASE: "/messages",  
      GET_MESSAGES: (Id: string) => `/conversation/${Id}`,
      SEND_MESSAGE: `/send`,
      GET_GROUP_MESSAGES: (groupId: string) => `/group/${groupId}`,
      SEND_GROUP_MESSAGE: (groupId: string) => `/group`,
      RECENT_CONVERSATIONS: "/conversations",
      UNREAD_MESSAGES: "/read",
      GET_USER_GALLERY: (conversationId: string) => `/conversations/${conversationId}/media`,
    },
  },
  IMAGES: {
    POST_IMAGES: `/images/upload`,
    GET_BY_ID: (id: string) => `/images/${id}`,
    DELETE: (id: string) => `/images/${id}`,
  },
  NOTIFICATIONS: {
    GET_NOTIFICATION_LIST: "/notifications",
    MARK_ALL_AS_READ:  "/notifications/read-all",
  },
};

