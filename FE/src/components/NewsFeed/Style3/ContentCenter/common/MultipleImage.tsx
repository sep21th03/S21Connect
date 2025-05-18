import { Href, ImagePath } from "../../../../../utils/constant";
import React, { FC } from "react";
import Image from "next/image";
import { Post } from "@/components/NewsFeed/Style1/Style1Types";
interface MultipleImageInterFace {
  imageUrl: string;
  moreImage?: boolean;
  moreImageCount?: number;
}
const MultipleImage: FC<MultipleImageInterFace> = ({ imageUrl, moreImage, moreImageCount }) => {

  return (
    <div className={`overlay ${moreImage ?"image-plus":""}`}>
      <div className="portfolio-image">
        <a href={Href}>
          <Image
            src={`${imageUrl}`}
            alt=""
            className="img-fluid lazyload bg-img"
            width={523}
            height={542}
          />
          {moreImage && <span>+20</span>}
        </a>
      </div>
    </div>
  );
};

export default MultipleImage;
