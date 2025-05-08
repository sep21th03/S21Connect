import { NextAuthOptions } from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { jwtDecode } from "jwt-decode";
import { JWT } from "@/utils/types/next-auth";

export const authoption: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/authentication/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      authorize: async (credentials, req) => {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Thiếu email hoặc mật khẩu.");
          }

          const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
            email: credentials.email,
            password: credentials.password,
          });

          const data = response.data;

          if (data && data.token) {
            const decodedToken = jwtDecode<JWT>(data.token);
            return {
              id: decodedToken.sub,
              email: decodedToken.email,
              name: `${decodedToken.first_name} ${decodedToken.last_name}`,
              username: decodedToken.username,
              token: data.token,
              refreshToken: data.refresh_token,
              image: decodedToken.avatar,
            };
          }

          return null;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            "Đăng nhập thất bại";
          throw new Error(errorMessage);
        }
      },
    }),
    Github({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.token = user.token;
        token.username = user.username;
        token.refreshToken = user.refreshToken;
        token.image = user.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string;
        session.token = token.token as string;
        session.refreshToken = token.refreshToken as string;
        session.user.image = token.image as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  debug: true,
};
