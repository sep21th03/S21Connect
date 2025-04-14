import { first } from 'lodash';
// types/user.ts

export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar: string | null;
    cover_photo: string | null;
    bio: string | null;
    is_admin: boolean;
    status: "active" | "banned" | "deleted";
    created_at: string;
    updated_at: string;
  }
  

  export interface UserToken {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    is_admin: number;
    token: string;
  }
  