import { Href, ImagePath } from "../../../../../utils/constant";
import React, { FC, useRef, useEffect } from "react";
import Image from "next/image";

interface MultipleImageInterFace {
  mediaUrl: string;
  moreImage?: boolean;
  moreImageCount?: number;
  registerVideoRef?: (url: string, video: HTMLVideoElement | null) => void;
}

const MultipleImage: FC<MultipleImageInterFace> = ({ 
  mediaUrl, 
  moreImage, 
  moreImageCount, 
  registerVideoRef 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);

  useEffect(() => {
    if (isVideo && registerVideoRef && videoRef.current) {
      registerVideoRef(mediaUrl, videoRef.current);
    }
    
    return () => {
      if (isVideo && registerVideoRef) {
        registerVideoRef(mediaUrl, null);
      }
    };
  }, [isVideo, mediaUrl, registerVideoRef]);

  const handleVideoClick = (e: React.MouseEvent) => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  };



  return (
    <div className={`overlay ${moreImage ? "image-plus" : ""}`}>
      <div className="portfolio-image">
        <a href={Href}>
          {isVideo ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              className="img-fluid bg-img"
              width={523}
              height={542}
              controls
              onClick={handleVideoClick}
              preload="metadata"
            />
          ) : (
            <Image
              src={mediaUrl}
              alt=""
              className="img-fluid lazyload bg-img"
              width={523}
              height={542}
            />
          )}
          {moreImage && <span>+{moreImageCount}</span>}
        </a>
      </div>
    </div>
  );
};

export default MultipleImage;