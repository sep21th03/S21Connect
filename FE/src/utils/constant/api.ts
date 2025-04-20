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
    },
    USER_PROFILE: (username: string) => `/profile/${username}`,
  },
};
