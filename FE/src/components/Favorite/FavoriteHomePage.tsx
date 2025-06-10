"use client"
import FavoriteLayout from "@/layout/FavoriteLayout";
import React, { FC } from "react";
import FavoriteHomePageContent from "./Home/FavoriteHomePageContent";

interface FavoriteHomePageProps {
  page: string;
}

const FavoriteHomePage: FC<FavoriteHomePageProps> = ({ page }) => {
  return (
    <FavoriteLayout loaderName="favoriteHomePage" page={page}>
      <FavoriteHomePageContent />
    </FavoriteLayout>
  );
};

export default FavoriteHomePage;
