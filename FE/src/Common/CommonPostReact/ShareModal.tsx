import { FC, useState } from "react";
import {Button,Input,Modal,ModalBody,ModalFooter,ModalHeader} from "reactstrap";
import ShareModalHeader from "./ShareModalHeader";
import UserDropDown from "./UserDropDown";
import { ImagePath, sharePost } from "../../utils/constant";
import { ShareModalProps } from "../CommonInterFace";
import Image from "next/image";
import PostImageShare from "@/components/NewsFeed/Style3/ContentCenter/PostImageShare";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { toast } from "react-toastify";

const ShareModal: FC<ShareModalProps> = ({ showModal, toggleModal, post }) => {
  const [showOption, setShowOption] = useState("private");
  const [content, setContent] = useState("");
  const [shareOption, setShareOption] = useState("public");
  
  const rawImage = Array.isArray(post?.images) ? post?.images[0] : post?.images;
  const imageList = typeof rawImage === "string" ? rawImage.split("|") : [];
  const handleSharePost = async () => {
    const response = await axiosInstance.post(API_ENDPOINTS.POSTS.SHARES.SHARE, {
      post_id: post?.id,
      visibility: shareOption,
      message: content,
    });
    if(response.status === 200) {
      toast.success("Chia sẻ bài viết thành công");
      toggleModal();
    }
  }

  return (
    <Modal isOpen={showModal} toggle={toggleModal} centered modalClassName="mobile-full-width" contentClassName="share-modal">
      <ModalHeader toggle={toggleModal}>
        <ShareModalHeader shareOption={shareOption} setShareOption={setShareOption} />
      </ModalHeader>
      <ModalBody>
        <UserDropDown setShowOption={setShowOption} showOption={showOption} post={post} />
        <div className="input-section">
          <Input type="text" className="emojiPicker" placeholder="write a comment.." value={content} onChange={(e) => setContent(e.target.value)}/>
        </div>
        <div className="post-section ratio2_1">
          <div className="post-img blur-up lazyloaded">
            { imageList.length > 1 &&
              <PostImageShare images={{ images: imageList }} />
            }
            { imageList.length === 1 &&
              <Image src={`${imageList[0]}`} className="img-fluid lazyload bg-img" alt="" fill/>
            }
          </div>
          <div className="post-content">
            <h3>{post?.content}</h3>
            <h5 className="tag">
              <span>{post?.tagfriends}</span>
            </h5>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button  onClick={handleSharePost}  color="solid">{sharePost}</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ShareModal;
