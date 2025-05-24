import React, { FC, useState } from "react";
import { Href, ImagePath } from "../../../../../../utils/constant/index";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import Image from "next/image";
import CommonVideoModal from "@/Common/Modals/CommonVideoModal";
import { PostDetailInterFace } from "../../../Style1Types";
import CloudinaryImage from "@/components/image/CloudinaryImage";

const PostImage: FC<PostDetailInterFace> = ({post,localPost,setLocalPost}) => {
  const [showModal, setShowModal] = useState(false)
  const modalToggle = ()=>setShowModal(!showModal)
  const imageList = post?.images?.split("|") || [];
  return (
    <div className="img-wrapper">
     {imageList[0] && (
        <CloudinaryImage
          src={imageList[0]}
          alt="post-image"
          width={385}
          height={225}
          className="img-fluid rounded"
          onClick={modalToggle}
        />
      )}
      {/* <div className="controler">
        <a href={Href} className="play"  onClick={modalToggle}>
          <DynamicFeatherIcon iconName="PlayCircle" className="iw-50 ih-50" />
        </a>
        <CommonVideoModal modal={showModal} toggle={modalToggle}/>
        <div className="duration">
          <h6>06:20</h6>
        </div>
        <a href={Href} className="volume">
          <DynamicFeatherIcon iconName="Volume2" className="iw-14 ih-14" />
        </a>
      </div> */}
    </div>
  );
};

export default PostImage;
