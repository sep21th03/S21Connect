import { Href } from "../../../../../utils/constant/index";
import { FC } from "react";
import { CommonGalleryImageProps } from "../../Style1Types";
import Image from "next/image";

const CommonGalleryImage: FC<CommonGalleryImageProps> = ({ imageUrl,onClickHandle }) => {
  return (
    <div className="overlay" onClick={onClickHandle}>
      <div className="portfolio-image">
        <a href={Href} className="blur-up lazyloaded">
          <Image
            src={imageUrl}
            alt="image"
            className="img-fluid lazyload bg-img"
            width={100}
            height={100}
          />
        </a>
      </div>
    </div>
  );
};

export default CommonGalleryImage;
