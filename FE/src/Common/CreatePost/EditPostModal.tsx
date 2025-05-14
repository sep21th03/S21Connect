import { FC, useEffect, useState } from "react";
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { Post } from "@/components/NewsFeed/Style1/Style1Types";
import EditModal from "@/Common/CreatePost/EditModal";
import UserDropDown from "@/Common/CommonPostReact/UserDropDown";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { toast } from "react-toastify";


interface EditPostModalProps {
  showModal: boolean;
  toggleModal: () => void;
  post: Post | null;
  setShowOption: (showOption: string) => void;
  showOption: string;
  onPostUpdated: (updatedPost: Post) => void;
}

const EditPostModal: FC<EditPostModalProps> = ({ showModal, toggleModal, post, setShowOption, showOption, onPostUpdated }) => {
    const [content, setContent] = useState(post?.content);
    useEffect(() => {
        if (post?.content) setContent(post.content);
      }, [post]);
    const handleEditPost = async () => {
        const response = await axiosInstance.post(API_ENDPOINTS.POSTS.EDIT_POST, {
            content: content,
            visibility: showOption,
            post_id: post?.post_id,
        });
        if(response.status === 200) {
            toast.success("Cập nhật bài viết thành công");
            toggleModal();
            onPostUpdated(response.data.data);
        }
    }

  return (
    <Modal isOpen={showModal} toggle={toggleModal} centered modalClassName="mobile-full-width" contentClassName="share-modal">
      <ModalHeader toggle={toggleModal}>
        <EditModal />    
      </ModalHeader>
      <ModalBody>
        <UserDropDown post={post} setShowOption={setShowOption} showOption={showOption}/>
        <div className="input-section">
          <Input type="text" className="emojiPicker" placeholder="write a comment.." value={content} onChange={(e) => setContent(e.target.value)}/>
        </div>
        <div className="post-section ratio2_1">
          {/* <div className="post-img bg-size blur-up lazyloaded">
            <CustomImage src={`${ImagePath}/post/1.jpg`} className="img-fluid blur-up lazyload bg-img" alt=""/>
          </div> */}
          {/* <div className="post-content">
            <h3>{post?.content}</h3>
            <h5 className="tag">
              <span>#ourcutepuppy,</span> #puppy, #birthday, #dog
            </h5>
          </div> */}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={handleEditPost} color="solid">Lưu</Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditPostModal;
