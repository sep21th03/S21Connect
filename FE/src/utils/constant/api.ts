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

  SETTING: {
    CHANGE_PASSWORD: "/auth/change-password",
    UPDATE_PROFILE: "/settings/update-profile",
    GET_PROFILE: "/settings/get-info",
    CONTACT_US: "/settings/contact-us",
  },

  POSTS: {
    CREATE_POST: "/posts",
    GET_MY_POSTS: "/posts/my_post",
    EDIT_POST: "/posts/edit",
    SHOW_POST: (
      postId: string,
      commentId?: string,
      replyCommentId?: string,
      reactionId?: string,
      notificationId?: string
    ) => {
      const params = new URLSearchParams();

      if (commentId) params.append("comment_id", commentId);
      if (replyCommentId) params.append("reply_comment_id", replyCommentId);
      if (reactionId) params.append("reaction_id", reactionId);
      if (notificationId) params.append("notification_id", notificationId);

      return `/posts/show/${postId}?${params.toString()}`;
    },
    GET_POSTS: (username: string) => `/posts/${username}`,
    GET_FRIEND_POSTS: "/posts/get_friend",
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
      GET: (id: number | string) => `/posts/${id}/reactions/get`,
    },
    SHARES: {
      SHARE: "/posts/shares/post",
      GET_SHARE: (postId: number | string) => `/posts/shares/${postId}`,
    },
    PAGES: {
      CREATE_PAGE_POST: (pageId: string) => `/posts/pages/${pageId}/create`,
      GET_PAGE_POSTS: (pageId: string) => `/posts/pages/${pageId}/get`,
      GET_MY_PAGES_POSTS: "/posts/pages/my-posts",
      CHECK_PERMISSION: (pageId: string) => `/posts/pages/${pageId}/permission`,
    },
  },

  STORIES: {
    CREATE: "/stories/create",
    GET_STORIES: "/stories",
    MARK_AS_SEEN: "/stories/mark-as-seen",
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
    UPDATE_BACKGROUND: "/profile/user/background",
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
    SEARCH_BOX: (keyword: string) =>
      `/friends/search-friend?searchTerm=${keyword}`,
  },

  USERS: {
    BASE: "/user",
    PROFILE: "/user/user-profile",
    HOVER_CARD: (userId: string) => `/${userId}/hovercard`,
    LIST_FRIENDS: (userId: string) => `/${userId}/list_friends`,
    LIST_FRIENDS_BY_USERNAME: (username: string) =>
      `/${username}/list_friends_by_username`,
    LIST_FRIENDS_LIMIT: (userId: string) => `/${userId}/list_friends_limit`,
    LAST_ACTIVE: (otherUserId: string) => `/user/update-last-active`,
    GET_STATS: "/user/get_stats",
    SEARCH_FRIENDS: (searchTerm: string) =>
      `/user/search-friend?searchTerm=${searchTerm}`,
    FRIEND_SUGGESTION: "/user/suggest_friends",
    ACTIVITY_PROFILE: (username: string) =>
      `/user/activity_profile/${username}`,
    ACTIVITY_LOGS: "/user/activity_logs",
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
      GET_USER_GALLERY: (conversationId: string) =>
        `/conversations/${conversationId}/media`,
      GET_UNREAD_MESSAGES_COUNT: "/conversations/message/count",
      SEARCH_MESSAGES: (conversationId: string, query: string) =>
        `/conversations/${conversationId}/messages/search?query=${query}`,
      IS_ARCHIVED: (conversationId: string) =>
        `/conversations/archive/${conversationId}`,
      ARCHIVE_CONVERSATION: "/conversations/archive-conversations",
      GET_NICKNAME: (conversationId: string) =>
        `/conversations/getNickname/${conversationId}`,
      UPDATE_NICKNAME: (conversationId: string, userId: string) =>
        `/conversations/updateNickname/${conversationId}/${userId}`,
      UPDATE_GROUP_NAME: (conversationId: string) =>
        `/conversations/${conversationId}/group-name`,
      UPDATE_GROUP_AVATAR: (conversationId: string) =>
        `/conversations/${conversationId}/group-avatar`,
      GET_GROUP_MEMBERS: (conversationId: string) =>
        `/conversations/getMembers/${conversationId}`,
    },
  },
  IMAGES: {
    IMAGES: {
      GET_BY_ID: "/images/user",
      GET_BY_TYPE: (userId: string, type: string) =>
        `/images/user/${userId}/type/${type}`,
      GET_SINGLE: `/images`,
      POST_IMAGES: `/images/upload-avatar`,
      BULK_UPLOAD: `/images/bulk-upload`,
      DELETE: `/images`,
      UPDATE: `/images`,
      IMAGES: {
        GET_BY_ID: (userId: string) => `/images/user/${userId}`,
        POST_IMAGES: `/images/upload`,
      },
      GET_ALL_PHOTOS: (userId: string) => `/images/users/${userId}/photos`,
      GET_ALBUM_IMAGES: (userId: string, folder: string) =>
        `/images/users/${userId}/album/${folder}`,
      GET_ALL_ALBUMS: (userId: string) => `/images/users/${userId}/albums`,
    },
  },
  NOTIFICATIONS: {
    GET_NOTIFICATION_LIST: "/notifications",
    MARK_ALL_AS_READ: "/notifications/read-all",
  },
  PAYMENT: {
    BILL: {
      CREATE: "/pay/create-bill",
      GET_LIST: "/pay/get-bill",
      DELETE: "/pay/delete-bill",
      PAY: "/pay/pay-bill",
      CANCEL: "/pay/cancel-bill",
      UNPAY: "/pay/unpay-bill",
      GET_INFO_BILL: "/get-info-bill",
      CHECK_BILL: "/check-bill",
      GET_HISTORY: "/pay/get-history",
      GET_INFO: "/pay/get_info",
      CREATE_DISBURSEMENT: "/pay/create-request-payment",
      GET_DISBURSEMENT: "/pay/get-payment",
    },
    SHOP: {
      CREATE_SHOP: "/pay/create-shop",
      GET_SHOP: "/pay/get-shop",
      DELETE_SHOP: "/pay/delete-shop",
      PAY_SHOP: (shop_id: string) => `/pay/pay-shop/${shop_id}`,
    },
  },
  REPORTS: {
    POST: (type: string, id: string) => `/report/${type}/${id}`,
    GET_REASONS: (type: string) => `/report/get-reasons/${type}`,
  },
  ADMIN: {
    GET_STATS: "/admin/get-stats",
    GET_ACTIVE_USERS_BY_DATE: "/admin/active-users-by-date",
    GET_USER_DISTRIBUTION: "/admin/user-distribution",
    GET_SUPPORT_REQUESTS: "/admin/support-requests-by-day",
    GET_REPORTS_BY_CATEGORY: "/admin/reports-by-category",
    GET_DASHBOARD_DATA: "/admin/data",
    REPORTS: "/admin/get-report-all",
    USERS: {
      GET_USERS: "/admin/users",
      UPDATE_STATUS: (userId: string) => `/admin/user/status/${userId}`,
    },
  },

  CLOUDINARY: {
    UPLOAD: "/cloudinary/upload",
    UPLOAD_POST: "/cloudinary/upload-post",
    DELETE_POST: "/cloudinary/delete-post",
    UPLOAD_PAGE: "/cloudinary/upload-image-fanpage",
  },

  FANPAGE: {
    GET_PAGES: "/pages",
    CREATE_PAGE: "/pages/create",
    GET_PAGE_FOLLOWS: "/pages/get-page/follows",
    GET_PAGE_BY_SLUG: (slug: string) => `/pages/${slug}/detail`,
    GET_PAGE_DETAIL: (pageId: string) => `/pages/${pageId}`,
    FOLLOW_PAGE: (pageId: string) => `/pages/${pageId}/follow`,
    UNFOLLOW_PAGE: (pageId: string) => `/pages/${pageId}/unfollow`,
    CHECK_FOLLOW_PAGE: (pageId: string) => `/pages/${pageId}/follow-status`,
    PAGE_ADMIN: (pageId: string) => `/pages/${pageId}/admins`,
    GET_PAGE_ALBUM: (pageId: string) => `/pages/${pageId}/photos`,
    STORE_REVIEW: (pageId: string) => `/pages/${pageId}/review`,
    GET_PAGE_REVIEW: (pageId: string) => `/pages/${pageId}/reviews`,
  },

  SEARCH: {
    SEARCH_ALL: (searchTerm: string) => `/search/all?searchTerm=${searchTerm}`,
    SEARCH_HISTORY: "/search/history",
    SAVE_SEARCH_HISTORY: "/search/save-history",
  },
};
