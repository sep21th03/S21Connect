//components\Favorite\Home\Fanpage\FanpagePage.tsx
"use client"
import FavoriteLayout from "@/layout/FavoriteLayout";
import React, { FC } from "react";
import FanpageContent from "./FanpageContent";

const FanpagePage: FC = () => {
  return (
    <FavoriteLayout loaderName="fanpagePage">
      <FanpageContent />
    </FavoriteLayout>
  );
};

export default FanpagePage;