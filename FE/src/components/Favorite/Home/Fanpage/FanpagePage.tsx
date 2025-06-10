//components\Favorite\Home\Fanpage\FanpagePage.tsx
"use client"
import FavoriteLayout from "@/layout/FavoriteLayout";
import React, { FC } from "react";
import FanpageContent from "./FanpageContent";

interface FanpagePageProps {
  page: string;
}

const FanpagePage: FC<FanpagePageProps> = ({ page }) => {
  return (
    <FavoriteLayout loaderName="fanpagePage" page={page}>
      <FanpageContent />
    </FavoriteLayout>
  );
};

export default FanpagePage;