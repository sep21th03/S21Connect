export const REASON_CODE_MAP = {
    Post: {
      P_Nudity: "Nội dung khỏa thân hoặc khiêu dâm",
      P_Violence: "Bạo lực hoặc tổ chức nguy hiểm",
      P_Harassment: "Quấy rối hoặc bắt nạt",
      P_HateSpeech: "Ngôn từ kích động thù địch hoặc biểu tượng thù hận",
      P_FalseInformation: "Thông tin sai sự thật",
      P_Spam: "Spam hoặc gây hiểu lầm",
      P_UnauthorizedSales: "Bán hàng không được phép",
      P_SuicideOrSelfInjury: "Tự tử hoặc tự gây thương tích",
      P_Other: "Khác",
    },
    User: {
      U_FakeAccount: "Tài khoản giả mạo",
      U_Impersonation: "Giả mạo người khác",
      U_Harassment: "Quấy rối hoặc bắt nạt",
      U_HateSpeech: "Ngôn từ kích động thù địch hoặc biểu tượng thù hận",
      U_FalseInformation: "Thông tin sai sự thật",
      U_SuicideOrSelfInjury: "Tự tử hoặc tự gây thương tích",
      U_Spam: "Spam",
      U_UnauthorizedSales: "Bán hàng không được phép",
      U_Other: "Khác",
    },
    Page: {
      Pg_Spam: "Trang spam hoặc gây hiểu lầm",
      Pg_Inappropriate: "Nội dung không phù hợp",
      Pg_FalseInformation: "Thông tin sai sự thật",
      Pg_HateSpeech: "Ngôn từ kích động thù địch hoặc nội dung xúc phạm",
      Pg_Impersonation: "Giả mạo người khác",
      Pg_UnauthorizedSales: "Bán hàng không được phép hoặc bất hợp pháp",
      Pg_Other: "Khác",
    },
    Comment: {
      C_Harassment: "Quấy rối hoặc bắt nạt",
      C_HateSpeech: "Ngôn từ kích động thù địch hoặc ngôn ngữ xúc phạm",
      C_Spam: "Spam hoặc quảng cáo không mong muốn",
      C_Threat: "Đe dọa hoặc bạo lực",
      C_Other: "Khác",
    },
    Group: {
      G_Spam: "Nhóm spam hoặc gây hiểu lầm",
      G_HateSpeech: "Ngôn từ kích động thù địch hoặc bạo lực",
      G_UnauthorizedSales: "Bán hàng không được phép hoặc bất hợp pháp",
      G_FalseInformation: "Thông tin sai sự thật hoặc lừa đảo",
      G_Impersonation: "Giả mạo tổ chức khác",
      G_Other: "Khác",
    },
  };
  

  export interface Report {
    id: number;
    reportable_type: 'Post' | 'User' | 'Comment' | 'Page' | 'Group';
    reportable_id: string | number;
    reporter_id: string;
    reason_code: string;
    reason_text: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'rejected'; 
    admin_note: string | null;
    created_at: string;
    updated_at: string;
    reportable: ReportablePost | null; 
  }
  

  export interface ReportablePost {
    id: number;
    post_id: string;
    user_id: string;
    content: string;
    images: string;
    videos: string;
    visibility: 'public' | 'friends' | 'private';
    type: string;
    feeling: string | null;
    checkin: string | null;
    bg_id: string | null;
    created_at: string;
    updated_at: string;
    is_comment_disabled: boolean | number;
  }

  interface ReportFilters {
    status: ReportStatusEnum;
    type: ReportTypeEnum;
  }
  

  export enum ReportStatusEnum {
    All = "all",
    Pending = "pending",
    Reviewed = "reviewed",
    Rejected = "rejected",
    Responded = "responded"
  }

  export enum ReportTypeEnum {
    All = "all",
    Post = "Post",
    Comment = "Comment",
    User = "User",
    Page = "Page",
    Group = "Group"
  }
  