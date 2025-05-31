import React, { FC, useState } from "react";
import { Href } from "../../../../../../utils/constant/index";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import CommonVideoModal from "@/Common/Modals/CommonVideoModal";
import { PostDetailInterFace } from "../../../Style1Types";
import CloudinaryImage from "@/components/image/CloudinaryImage";

const PostImage: FC<PostDetailInterFace> = ({
  post,
  localPost,
  setLocalPost,
  shouldOpenComments,
  highlightCommentId,
  highlightReplyId,
  isShared,
}) => {
  const [showModal, setShowModal] = useState(false);
  const modalToggle = () => setShowModal(!showModal);

  const imageList = post?.images?.split("|") || [];
  const videoList = post?.videos?.split("|") || [];

  return (
    <div className="img-wrapper relative">
      {videoList.length > 0 && videoList[0] ? (
        <>
          <video
            width="100%"
            height="auto"
            controls
            className="rounded"
            poster={imageList[0] || undefined}
          >
            <source src={videoList[0]} type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ video.
          </video>

          <div className="controler">
            {/* <a href={Href} className="play" onClick={modalToggle}>
              <DynamicFeatherIcon iconName="PlayCircle" className="iw-50 ih-50" />
            </a> */}
            <CommonVideoModal
              modal={showModal}
              toggle={modalToggle}
              videoUrl={videoList[0]}
            />
          </div>
        </>
      ) : imageList.length > 0 && imageList[0] ? (
        <CloudinaryImage
          src={imageList[0]}
          alt="post-image"
          width={385}
          height={225}
          className="img-fluid rounded"
          onClick={modalToggle}
        />
      ) : null}
    </div>
  );
};

export default PostImage;
