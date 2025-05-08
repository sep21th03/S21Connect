// components/ImageUploader.tsx
import React, { useState, useRef, ChangeEvent } from 'react';
import { Row, Col, Card, CardBody, Button, Spinner } from 'reactstrap';
import axios from 'axios';

interface ImageUploaderProps {
  onImageUpload: (imageData: ImageData) => void;
  type: string; // 'avatar', 'post', 'banner', etc.
}

interface ImageData {
  url: string;
  public_id: string;
  folder: string;
  type: string;
  width: number;
  height: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, type }) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Tạo form data để upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'avatar_preset'); // Thay thế bằng preset của bạn
      formData.append('folder', `avatars/${type}`); // Theo yêu cầu, folder là /avatars/
      
      // Upload trực tiếp lên Cloudinary
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dxzwfef7y/image/upload`, // Thay thế bằng cloud name của bạn
        formData
      );
      
      // Dữ liệu trả về từ Cloudinary
      const imageData: ImageData = {
        url: response.data.secure_url,
        public_id: response.data.public_id,
        folder: `avatars/${type}`,
        type: type,
        width: response.data.width,
        height: response.data.height
      };
      
      // Gửi dữ liệu lên backend
      await axios.post('/api/images', imageData);
      
      // Callback cho component cha
      onImageUpload(imageData);
      
      // Hiển thị preview
      setPreviewUrl(response.data.secure_url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Tạo object URL cho preview
      setPreviewUrl(URL.createObjectURL(file));
      
      // Upload lên Cloudinary
      uploadToCloudinary(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="image-uploader-card">
      <CardBody>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="d-none"
        />
        
        <div className="text-center mb-3">
          <Button 
            color="primary" 
            onClick={triggerFileInput}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Spinner size="sm" /> Đang tải...
              </>
            ) : (
              `Tải ảnh ${type} lên`
            )}
          </Button>
        </div>
        
        {previewUrl && (
          <div className="image-preview mt-3">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="img-fluid rounded"
              style={{ maxHeight: '200px' }} 
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ImageUploader;