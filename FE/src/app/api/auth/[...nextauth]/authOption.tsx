import { NextAuthOptions } from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import {jwtDecode} from "jwt-decode";
import { UserToken } from "@/utils/interfaces/user";
import { JWT } from "@/utils/types/next-auth";


export const authoption: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, 
  },
  pages: {
    signIn: "/authentication/login",
    signOut: "/authentication/login",
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
      authorize: async (credentials) => {
      
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Thiếu email hoặc mật khẩu.");
          }
      
          const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
            email: credentials.email,
            password: credentials.password,
          });
      
          const data = response.data;
          console.log("Đăng nhập thành công:", response);
      
          if (data && data.token) {
            const decodedToken = jwtDecode<JWT>(data.token);
            return {
              id: decodedToken.sub,
              first_name: decodedToken.first_name,
              last_name: decodedToken.last_name,
              email: decodedToken.email,
              username: decodedToken.username,
              is_admin: decodedToken.is_admin,
              token: data.token, 
            } as UserToken;
          }
      
          return null;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            "Đăng nhập thất bại";
          throw new Error(errorMessage);
        }
      }
      
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
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.name = user.first_name + " " + user.last_name;
        token.username = user.username;
        token.is_admin = user.is_admin;
        token.token = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.first_name = token.first_name as string;
        session.user.last_name = token.last_name as string;
        session.user.username = token.username as string;
        session.user.is_admin = token.is_admin as number;
        session.token = token.token as string; 
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow relative URLs (like "/newsfeed/style1")
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allow external URLs (ensure they match the base URL)
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default to baseUrl if any issue
      return baseUrl;
    },
  },
  debug:true
  
};
