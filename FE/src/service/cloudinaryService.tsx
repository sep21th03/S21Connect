import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";

type UploadedFile = {
    url: string;
    resource_type: "image" | "video";
  };
  
  type UploadResult = {
    images: string[];
    videos: string[];
  };


  export  const uploadFilesToCloudinary = async (
    files: File[]
  ): Promise<UploadResult> => {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.CLOUDINARY.UPLOAD_POST,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 && response.data.urls) {
        const urls: UploadedFile[] = response.data.urls;
        const images = urls
          .filter((item) => item.resource_type === "image")
          .map((item) => item.url);
        const videos = urls
          .filter((item) => item.resource_type === "video")
          .map((item) => item.url);
        return { images, videos };
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };