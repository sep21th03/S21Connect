// @/utils/types/next-auth.d.ts
import { JWT as NextAuthJWT } from "next-auth";

// Định nghĩa kiểu JWT tùy chỉnh
export interface JWT {
  iss: string;      // Issuer (Nguồn cấp phát token)
  iat: number;      // Thời gian tạo token
  exp: number;      // Thời gian hết hạn token
  nbf: number;      // Thời gian bắt đầu có hiệu lực
  jti: string;      // ID của token
  sub: string;      // Subject (thường là ID người dùng)
  prv: string;      // Quyền riêng tư (có thể là mã khóa hoặc thông tin quyền truy cập)
  username: string; // Tên đăng nhập
  email: string;    // Email người dùng
  first_name: string; // Tên người dùng
  last_name: string;  // Họ người dùng
  is_admin: number;   // Quyền admin (1 hoặc 0)
  token: string;      // Token gốc, nếu cần lưu lại
  avatar: string;    // URL ảnh đại diện
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      name: string;
      username: string;
      is_admin: number;
      token: string;
      avatar: string;
    };
    token: string;
  }

  interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    is_admin: number;
    token: string;
    avatar: string;
  }
}
