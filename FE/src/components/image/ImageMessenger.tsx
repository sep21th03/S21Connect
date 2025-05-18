import { ChangeEvent, useState } from "react";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";

interface ImageMessengerProps {
  onImageUpload: (file: File) => void;
}

const ImageUploaderMessenger = ({ onImageUpload }: ImageMessengerProps) => {
    const [isUploading, setIsUploading] = useState(false);
  
    const uploadToCloudinary = async (file: File) => {
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_MESSAGE_IMAGE!);
        formData.append("folder", process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER_MESSAGE_IMAGE!);
  
        const response = await axios.post(
          process.env.NEXT_PUBLIC_CLOUDINARY_API!,
          formData
        );
  
        const imageUrl = response.data.secure_url;
  
        // Gửi lên backend nếu cần (tùy use case của bạn)
        await axiosInstance.post(API_ENDPOINTS.IMAGES.POST_IMAGES, {
          url: imageUrl,
          public_id: response.data.public_id,
          folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER_MESSAGE_IMAGE!,
          type: "album",
          created_at: new Date().toISOString(),
          width: response.data.width,
          height: response.data.height,
        });
  
        return imageUrl;
      } catch (err) {
        console.error("Upload failed", err);
        alert("Upload failed");
        return null;
      } finally {
        setIsUploading(false);
      }
    };
  
    const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = await uploadToCloudinary(file);
        if (url) {
          onImageUpload(url);
        }
      }
    };
  
    return (
      <>
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{ display: "none" }}
          id="messenger-image-upload"
        />
        <label htmlFor="messenger-image-upload" style={{ cursor: "pointer" }}>
          <img src="/path-to/image.svg" alt="Upload" width={20} height={20} />
          {isUploading && <span>Uploading...</span>}
        </label>
      </>
    );
  };
  
  export default ImageUploaderMessenger;