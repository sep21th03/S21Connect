import CommonGalleryPhotos from "@/Common/CommonGalleryPhotos";
import FavoriteLayout from "@/layout/FavoriteLayout";
import React, { FC } from "react";

interface FavoritePhotosPageProps {
  page: string;
}

const FavoritePhotosPage: FC<FavoritePhotosPageProps> = ({ page }) => {
  return (
    <FavoriteLayout loaderName="favoriteGallery" page={page}>
      <div className="page-content">
        <div className="content-center w-100">
          <CommonGalleryPhotos />
        </div>
      </div>
    </FavoriteLayout>
  );
};

export default FavoritePhotosPage;
