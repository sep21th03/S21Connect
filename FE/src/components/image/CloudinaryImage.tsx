import React from "react";
import Image from "next/image";

interface CloudinaryImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
}

const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  alt = "cloudinary-image",
  width = 500,
  height = 500,
  className = "",
  onClick,
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onClick={onClick}
      unoptimized 
    />
  );
};

export default CloudinaryImage;
