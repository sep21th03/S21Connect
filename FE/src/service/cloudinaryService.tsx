import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";

type UploadedFile = {
  url: string;
  public_id: string;
  resource_type: "image" | "video";
  format: string;
  width: number;
  height: number;
  duration?: number | null;
};

type UploadResult = {
  files: UploadedFile[];
};

export const uploadFilesToCloudinary = async (
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
      const files: UploadedFile[] = response.data.urls.map((item: any) => ({
        url: item.url,
        public_id: item.public_id,
        resource_type: item.resource_type,
        format: item.format,
        width: item.width,
        height: item.height,
        duration: item.duration,
      }));

      return { files };
    } else {
      throw new Error("Upload failed");
    }
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

// profile service

export interface CloudinaryImage {
  id: string;
  url: string;
  public_id: string;
  type: string;
  created_at: string;
  updated_at: string;
  width?: number;
  height?: number;
}

export interface ImageServiceResponse {
  success: boolean;
  data: CloudinaryImage[];
  message?: string;
}

class ImageService {
  async getImagesByUserId(): Promise<ImageServiceResponse> {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.IMAGES.IMAGES.GET_BY_ID}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching images:", error);
      throw new Error("Failed to fetch images");
    }
  }

  async deleteImage(imageId: string): Promise<boolean> {
    try {
      const response = await axiosInstance.delete(
        `${API_ENDPOINTS.IMAGES.IMAGES.DELETE}/${imageId}`
      );
      return response.data.success;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new Error("Failed to delete image");
    }
  }

  async getImageById(imageId: string): Promise<CloudinaryImage | null> {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.IMAGES.IMAGES.GET_SINGLE}/${imageId}`
      );
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  }

  async uploadImage(
    file: File,
    userId: string
  ): Promise<{
    success: boolean;
    message: string;
    data: CloudinaryImage;
  } | null> {
    try {
      if (!(file instanceof File)) {
        console.error("Invalid file object:", file);
        return null;
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", userId);

      const response = await axiosInstance.post(
        API_ENDPOINTS.IMAGES.IMAGES.POST_IMAGES,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      if (
        (response.status === 200 || response.status === 201) &&
        response.data.success
      ) {
        return response.data;
      } else {
        throw new Error(
          `Upload failed: ${response.data.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  }

  async getAlbums(userId: string) {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.IMAGES.IMAGES.GET_ALL_ALBUMS(userId)
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching albums:", error);
      throw error;
    }
  }

  async getAlbumImages(userId: string, folder: string) {
    try {
      const encodedFolder = encodeURIComponent(folder);
      const response = await axiosInstance.get(
        API_ENDPOINTS.IMAGES.IMAGES.GET_ALBUM_IMAGES(userId, encodedFolder)
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching album images:", error);
      throw error;
    }
  }

  async getAllPhotos(userId: string) {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.IMAGES.IMAGES.GET_ALL_PHOTOS(userId)
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching all photos:", error);
      throw error;
    }
  }

  async uploadPageImage({ image, type }: { image: File; type: string }) {
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("type", type);

      const response = await axiosInstance.post(
        API_ENDPOINTS.CLOUDINARY.UPLOAD_PAGE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading page image:", error);
      throw error;
    }
  }
}

export const imageService = new ImageService();
