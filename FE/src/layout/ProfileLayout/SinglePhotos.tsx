// components/SinglePhotos.tsx
import React, { FC, useEffect, useState } from "react";
import { CloseAlbum, Href, ImagePath } from "../../utils/constant/index";
import { Col, Input, Label, Row, Button, Spinner } from "reactstrap";
import { SinglePhotosInterFace } from "../LayoutTypes";
import CustomImage from "@/Common/CustomImage";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { useSession } from "next-auth/react";
import axiosInstance from "@/utils/axiosInstance";
import axios from "axios";
import { API_ENDPOINTS } from "@/utils/constant/api";

interface CloudinaryImage {
  id: string;
  url: string;
  public_id: string;
  type: string;
  created_at: string;
}

const SinglePhotos: FC<SinglePhotosInterFace> = ({
  showPhotos,
  setShowPhotos,
  handleImageUrl,
  userid,
}) => {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchImagesRef = React.useRef(false);

  useEffect(() => {
    if (showPhotos && !fetchImagesRef.current) {
      fetchImages();
      fetchImagesRef.current = true; 
    }
  }, [showPhotos, userid]); 

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.IMAGES.GET_BY_ID(userid)}`
      );
      if (response.data.success && response.data.data.length > 0) {
        setImages(response.data.data);
        setSelectedImage(response.data.data[0].url);
        handleImageUrl(response.data.data[0].url);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  // Upload ảnh lên Cloudinary
  const uploadToCloudinary = async (file: File) => {
    try {
      setUploading(true);

      // Tạo form data để upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_ALBUM!
      );
      formData.append(
        "folder",
        process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER_ALBUM!
      );

      // Upload trực tiếp lên Cloudinary
      const response = await axios.post(
        process.env.NEXT_PUBLIC_CLOUDINARY_API!,
        formData
      );

      // Dữ liệu trả về từ Cloudinary
      const imageData = {
        url: response.data.secure_url,
        public_id: response.data.public_id,
        folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER_ALBUM!,
        type: "post",
        created_at: response.data.created_at,
        userid: userid,
        width: response.data.width,
        height: response.data.height,
      };

      // Gửi dữ liệu lên backend
      const saveResponse = await axiosInstance.post(
        API_ENDPOINTS.IMAGES.POST_IMAGES,
        imageData
      );

      // Thêm ảnh mới vào danh sách
      setImages([saveResponse.data.data, ...images]);
      setSelectedImage(saveResponse.data.data.url);
      handleImageUrl(saveResponse.data.data.url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadToCloudinary(file);
    }
  };

  const handleSelect = (image: CloudinaryImage) => {
    setSelectedImage(image.url);
    handleImageUrl(image.url);
  };

  // Hiển thị danh sách ảnh mặc định nếu không có ảnh từ Cloudinary
  const datas = [1, 2, 3, 4, 5, 6];

  return (
    <div className={`gallery-open ${showPhotos ? "d-block" : ""}`}>
      <div className="close-album" onClick={() => setShowPhotos(!showPhotos)}>
        <h5>{CloseAlbum}</h5>
      </div>

      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h5>Album Photos</h5>
        <div>
          <Input
            type="file"
            id="upload-photo"
            onChange={handleFileChange}
            className="d-none"
            accept="image/*"
          />
          <Label htmlFor="upload-photo" className="btn btn-primary mb-0">
            {uploading ? (
              <>
                <Spinner size="sm" /> Uploading...
              </>
            ) : (
              <>
                <DynamicFeatherIcon iconName="Upload" className="me-0" />
              </>
            )}
          </Label>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2">Loading images...</p>
        </div>
      ) : images.length > 0 ? (
        <Row className="gallery-photo ratio_landscape">
          {images.map((image) => (
            <Col sm="4" xs="6" key={image.id}>
              <Label htmlFor={`chkAni${image.id}`} />
              <Input
                className="radio_animated"
                id={`chkAni${image.id}`}
                type="radio"
                onChange={() => handleSelect(image)}
                name="Radios1"
                checked={selectedImage === image.url}
              />
              <div className="image-box">
                <div className="image blur-up lazyloaded">
                  <img
                    src={image.url}
                    alt="image"
                    className="img-fluid lazyload bg-img"
                  />
                </div>
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        // Hiển thị ảnh mặc định nếu không có ảnh từ Cloudinary
        <Row className="gallery-photo ratio_landscape">
          {datas.map((data) => (
            <Col sm="4" xs="6" key={data}>
              <Label htmlFor={`chkAni${data}`} />
              <Input
                className="radio_animated"
                id={`chkAni${data}`}
                type="radio"
                onChange={() => handleImageUrl(`post/${data}.jpg`)}
                name="Radios1"
                defaultChecked={data === 1}
              />
              <div className="image-box">
                <div className="image bg-size blur-up lazyloaded">
                  <CustomImage
                    src={`${ImagePath}/post/${data}.jpg`}
                    alt="image"
                    className="img-fluid blur-up lazyload bg-img"
                  />
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default SinglePhotos;
