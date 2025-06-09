"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useParams, usePathname } from "next/navigation";
import { FullUserProfile } from "@/utils/interfaces/user";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { useSession } from "next-auth/react";

interface GlobalProfileContextType {
  userProfile: FullUserProfile | null;
  isOwnProfile: boolean;
  friendshipStatus: string;
  setFriendshipStatus: (status: string) => void;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const GlobalProfileContext = createContext<GlobalProfileContextType | undefined>(undefined);

const profileCache = new Map<string, FullUserProfile>();
const cacheExpiry = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000;

interface GlobalProfileProviderProps {
  children: ReactNode;
}

export const GlobalProfileProvider: React.FC<GlobalProfileProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<FullUserProfile | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState("none");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const params = useParams();
  const pathname = usePathname();
  const username = params?.username as string;

  const isProfilePage = pathname?.includes('/profile/');

  const fetchUserProfile = async (forceRefresh = false) => {
    if (!username || !isProfilePage) return;

    const now = Date.now();
    const cachedProfile = profileCache.get(username);
    const cacheTime = cacheExpiry.get(username);

    if (!forceRefresh && cachedProfile && cacheTime && (now - cacheTime < CACHE_DURATION)) {
      setUserProfile(cachedProfile);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.get<ApiResponse<FullUserProfile>>(
        API_ENDPOINTS.PROFILE.USER_PROFILE(username)
      );
      const profileData = response.data.data;
      
      profileCache.set(username, profileData);
      cacheExpiry.set(username, now);
      
      setUserProfile(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchUserProfile(true);
  };

  useEffect(() => {
    if (isProfilePage && username) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
      setFriendshipStatus("none");
    }
  }, [username, isProfilePage]);

  const isOwnProfile = userProfile?.user.username === session?.user?.username;

  return (
    <GlobalProfileContext.Provider
      value={{
        userProfile,
        isOwnProfile,
        friendshipStatus,
        setFriendshipStatus,
        isLoading,
        refreshProfile,
      }}
    >
      {children}
    </GlobalProfileContext.Provider>
  );
};

export const useGlobalProfile = () => {
  const context = useContext(GlobalProfileContext);
  if (context === undefined) {
    throw new Error('useGlobalProfile must be used within a GlobalProfileProvider');
  }
  return context;
};