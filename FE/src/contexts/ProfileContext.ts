"use client";
import { createContext, useContext } from "react";
import { FullUserProfile } from "@/utils/interfaces/user";

interface ProfileContextType {
  userProfile: FullUserProfile | null;
  isOwnProfile: boolean;
  friendshipStatus: string;
  setFriendshipStatus: (status: string) => void;
}

export const ProfileContext = createContext<ProfileContextType | null>(null);

export const useProfileContext = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfileContext bắt buộc phải được sử dụng trong ProfileProvider");
  return ctx;
};
