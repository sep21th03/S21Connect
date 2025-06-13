import FavoriteLayout from "@/layout/FavoriteLayout";
import React, { FC } from "react";
import FavoriteReviewPageContent from "./FavoriteReviewPageContent";

interface FavoriteReviewsPageProps {
  page: string;
}

const FavoriteReviewsPage: FC<FavoriteReviewsPageProps> = ({ page }) => {
  return (
    <FavoriteLayout loaderName="favoriteReviews" page={page}>
      <FavoriteReviewPageContent page={page} />
    </FavoriteLayout>
  );
};

export default FavoriteReviewsPage;
