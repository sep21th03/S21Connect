import Album from "@/Common/CommonGalleryPhotos/Album";
import React, { FC, useState } from "react";
import SinglePhotos from "./SinglePhotos";
import { TabPaneInterFace } from "../LayoutTypes";

const AlbumTabPane: FC<TabPaneInterFace> = ({handleImageUrl, userid}) => {
  const [showPhotos, setShowPhotos] = useState(false);
  const handleTogglePhotos = (value: boolean) => {
    setShowPhotos(value);
  };
  return (
    <>
      <Album setShowPhotos={handleTogglePhotos} showPhotos={showPhotos} userid={userid}/>
      <SinglePhotos setShowPhotos={handleTogglePhotos} showPhotos={showPhotos}  handleImageUrl={handleImageUrl} userid={userid}/>
    </>
  );
};

export default AlbumTabPane;
