import PageGalleryPhotos  from "@/Common/CommonGalleryPhotos/PageGalleryPhotos";
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
          <PageGalleryPhotos/>
        </div>
      </div>
    </FavoriteLayout>
  );
};

export default FavoritePhotosPage;
