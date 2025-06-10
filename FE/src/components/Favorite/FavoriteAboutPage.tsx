"use client"

import FavoriteLayout from "@/layout/FavoriteLayout";
import React, { FC } from "react";
import FavoriteAboutPageContent from "./FavoriteAboutPageContent";

interface FavoriteAboutPageProps {
  page: string;
}

const FavoriteAboutPage: FC<FavoriteAboutPageProps> = ({ page }) => {
  return (
    <FavoriteLayout loaderName="favoriteAboutPage" page={page}>
      <FavoriteAboutPageContent />
    </FavoriteLayout>
  );
};

export default FavoriteAboutPage;
