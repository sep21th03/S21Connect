import Album from "@/Common/CommonGalleryPhotos/Album";
import React, { FC, useState } from "react";
import SinglePhotos from "./SinglePhotos";
import { TabPaneInterFace } from "../LayoutTypes";

const AlbumTabPane: FC<TabPaneInterFace> = ({ handleImageUrl, userid }) => {
  const [showPhotos, setShowPhotos] = useState(false);

  const handleTogglePhotos = (value: boolean) => {
    setShowPhotos(value);
  };

  return (
    <div className="album-tab-container">
      {!showPhotos && (
        <div className="mb-3">
          <small className="text-muted">
            Chọn album để xem ảnh, hoặc sử dụng nút làm mới để tải lại album.
          </small>
        </div>
      )}
      
      <Album 
        setShowPhotos={handleTogglePhotos} 
        showPhotos={showPhotos} 
        userid={userid}
        lg={4}
        xl={4}
      />
      
      <SinglePhotos 
        setShowPhotos={handleTogglePhotos} 
        showPhotos={showPhotos}  
        handleImageUrl={handleImageUrl} 
        userid={userid}
      />
    </div>
  );
};

export default AlbumTabPane;