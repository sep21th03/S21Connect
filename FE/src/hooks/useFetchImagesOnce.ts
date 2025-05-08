import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";

// Keep track of which user IDs have already been fetched
const fetchedUsers = new Set<string>();

/**
 * Custom hook to ensure images are fetched just once per user
 */
export function useFetchImagesOnce(userid: string, shouldFetch: boolean) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchKey = `user-${userid}`;
    const alreadyFetched = fetchedUsers.has(fetchKey);
    
    // Only fetch if:
    // 1. shouldFetch is true (usually controlled by showPhotos)
    // 2. We haven't fetched for this component instance
    // 3. We haven't fetched for this user ID globally
    if (shouldFetch && !hasFetched.current && !alreadyFetched) {
      console.log("Fetching images ONCE for user:", userid);
      
      const fetchImages = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get(
            `${API_ENDPOINTS.IMAGES.GET_BY_ID(userid)}`
          );
          
          if (response.data.success && response.data.data.length > 0) {
            setImages(response.data.data);
          }
        } catch (err) {
          console.error("Error fetching images:", err);
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      };

      // Mark as fetched before the actual fetch to prevent race conditions
      hasFetched.current = true;
      fetchedUsers.add(fetchKey);
      
      fetchImages();
    }
  }, [userid, shouldFetch]);

  return { images, loading, error };
}