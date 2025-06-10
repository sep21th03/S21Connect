export interface Page {
    id: string;
    name: string;
    slug: string;
    description?: string;
    avatar?: string;
    cover_image?: string | null;
    followers_count: number;
    is_followed?: boolean;
    is_admin?: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
    creator: {
      id: string;
      username: string;
      first_name: string;
      last_name: string;
      gender: string;
      birthday: string;
      email: string;
      email_verified_at: string;
      last_active: string;
      avatar: string;
      cover_photo: string;
      bio: string;
      is_admin: number;
      status: string;
      created_at: string;
      updated_at: string;
      vnd: string;
      secret_code: string | null;
    };
    admins: {
      id: string;
      page_id: string;
      user_id: string;
      role: string;
      created_at: string;
      updated_at: string;
      user: {
        id: string;
        username: string;
        first_name: string;
        last_name: string;
        gender: string;
        birthday: string;
        email: string;
        email_verified_at: string;
        last_active: string;
        avatar: string;
        cover_photo: string;
        bio: string;
        is_admin: number;
        status: string;
        created_at: string;
        updated_at: string;
        vnd: string;
        secret_code: string | null;
      };
    }[];
    followers: any[]; 
  }
  