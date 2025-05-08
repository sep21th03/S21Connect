// components/Album.tsx
import React, { ChangeEvent, FC, useState, useEffect } from "react";
import { Card, CardBody, Col, Input, Row, Spinner } from "reactstrap";
import DynamicFeatherIcon from "../DynamicFeatherIcon";
import { CreateAlbum, ImagePath, photos } from "../../utils/constant";
import CustomImage from "../CustomImage";
import { AlbumInterFace } from "../CommonInterFace";
import axiosInstance from "@/utils/axiosInstance";
import axios from "axios";
import { API_ENDPOINTS } from "@/utils/constant/api";

interface ImageData {
  url: string;
  public_id: string;
  folder: string;
  type: string;
  width: number;
  height: number;
  created_at: string;
  userid: string;
}

interface AlbumData {
  tittle: string;
  image: string;
  id?: string;
}

const Album: FC<AlbumInterFace> = ({ showPhotos, setShowPhotos, lg, xl, userid }) => {
  const [albumDetail, setAlbumDetail] = useState<AlbumData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Lấy danh sách album từ server khi component được mount
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.IMAGES.GET_BY_ID(userid)}`
        );
        
        if (response.data.success && response.data.data.length > 0) {
          // Chuyển đổi dữ liệu từ server thành định dạng albumDetail
          const albums = response.data.data.map((image: any) => ({
            id: image.id,
            tittle: image.public_id.split('/').pop().replace(/\.\w+$/, '') || "Album",
            image: image.url
          }));
          
          setAlbumDetail(albums);
        }
      } catch (error) {
        console.error("Error fetching albums:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();
  }, [userid]);

  const uploadToCloudinary = async (file: File) => {
    try {
      setIsUploading(true);

      // Tạo form data để upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_AVATAR!); // Preset đã cấu hình trong Cloudinary
      formData.append("folder", process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER_ALBUM!); // Folder là /avatars/album theo yêu cầu

      // Upload trực tiếp lên Cloudinary
      const response = await axios.post(
        process.env.NEXT_PUBLIC_CLOUDINARY_API!,
        formData
      );

      // Dữ liệu trả về từ Cloudinary
      const imageData: ImageData = {
        url: response.data.secure_url,
        public_id: response.data.public_id,
        folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER_ALBUM!,
        type: "album",
        created_at: new Date().toISOString(),
        userid: userid,
        width: response.data.width,
        height: response.data.height,
      };

      // Gửi dữ liệu lên backend
      const saveResponse = await axiosInstance.post(API_ENDPOINTS.IMAGES.POST_IMAGES, imageData);

      return {
        imageData,
        savedData: saveResponse.data.data
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await uploadToCloudinary(file);
      if (result) {
        // Tạo album mới với tên là tên file hoặc public_id từ Cloudinary
        // và lấy id từ response backend để sử dụng khi xóa ảnh
        const fileName = file.name.replace(/\.\w+$/, '') || "New Album";
        const newAlbum: AlbumData = {
          id: result.savedData.id,
          tittle: fileName,
          image: result.imageData.url,
        };
        
        setAlbumDetail([newAlbum, ...albumDetail]);
      }
    }
  };

  return (
    <Row className={`gallery-album ${showPhotos ? "d-none" : ""}`}>
      <Col lg={lg} xl={xl} xs="6">
        <Card className="add-card">
          <div className="add-icon">
            <div>
              {isUploading ? (
                <Spinner color="primary" />
              ) : (
                <>
                  <DynamicFeatherIcon
                    iconName="PlusCircle"
                    className="iw-30 ih-30"
                  />
                  <Input
                    onChange={handleChange}
                    type="file"
                    className="form-control-file"
                    disabled={isUploading}
                    accept="image/*"
                  />
                  <h5 className="card-title">{CreateAlbum}</h5>
                  <p>Create album in just few minutes</p>
                </>
              )}
            </div>
          </div>
        </Card>
      </Col>
      
      {isLoading ? (
        <Col className="text-center">
          <Spinner color="primary" />
          <p className="mt-2">Loading albums...</p>
        </Col>
      ) : (
        albumDetail.map((data, index) => (
          <Col
            lg={lg}
            xl={xl}
            xs="6"
            key={data.id || index}
            onClick={() => setShowPhotos(!showPhotos)}
          >
            <a className="card collection bg-size blur-up lazyloaded">
              {/* Hiển thị ảnh từ Cloudinary */}
              <img
                className="card-img-top img-fluid blur-up lazyload bg-img"
                src={data.image}
                alt={data.tittle}
              />
              <CardBody>
                <h5 className="card-title">{data.tittle}</h5>
                <h6>Album</h6>
              </CardBody>
            </a>
          </Col>
        ))
      )}
    </Row>
  );
};

export default Album;