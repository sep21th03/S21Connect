import React, { FC } from "react";
import AboutCard from "./AboutCard";
import LikedPages from "@/components/NewsFeed/Style1/LeftContent/LikedPages";
import { usePageInfo } from "@/contexts/PageInfoContext";
import { Page } from "@/service/fanpageService";

const ContentLeft: FC = () => {
  const pageInfo = usePageInfo();
  return (
    <div className="content-left">
      <div className="sticky-top">
        <AboutCard pageInfo={pageInfo as unknown as Page}/>
        <LikedPages />
      </div>
    </div>
  );
};

export default ContentLeft;
