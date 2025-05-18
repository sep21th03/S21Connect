import { first } from 'lodash';
// types/user.ts

export interface User {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar: string | null;
    cover_photo: string | null;
    gender: string | null;
    birthday: string | null;
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
  
  export interface UserProfile {
    id: number;
    user_id: string;
  
    phone_number?: string | null;
    location?: string | null;
    workplace?: string | null;
    current_school?: string | null;
    past_school?: string | null;
  
    relationship_status: RelationshipStatus
  
    is_phone_number_visible: boolean;
    is_location_visible: boolean;
    is_workplace_visible: boolean;
    is_school_visible: boolean;
    is_past_school_visible: boolean;
    is_relationship_status_visible: boolean;
  
    created_at?: string;
    updated_at?: string;
  }
  
  export interface FullUserProfile {
    user: User;
    profile: UserProfile;
  }

  export type RelationshipStatus = 
  | 'single'
  | 'in_a_relationship'
  | 'engaged'
  | 'married'
  | 'complicated'
  | 'separated'
  | 'divorced'
  | 'widowed';

  export interface UserAbout {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    bio: string;
    user_data: {
      followers: number;
      following: number;
      friends: number;
    }
  }

  export interface UserInforBirthday {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    birthday: string;
    avatar: string;
    location: string;
    gender: string;
  }

  export interface UserStats {
    total_posts: number | null;
    total_friends: number | null;
  }
