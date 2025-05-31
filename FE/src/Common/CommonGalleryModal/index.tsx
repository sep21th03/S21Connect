import { FC } from "react";
import { Col, Modal, Row } from "reactstrap";
import { CommonGalleryModalInterFace } from "../CommonInterFace";
import ImageGallery from "./ImageGallery";
import CommonLikePanel from "../CommonLikePanel";
import CommonPostReact from "../CommonPostReact";
import UserHeading from "./UserHeading";

const CommonGalleryModal: FC<CommonGalleryModalInterFace> = ({modal,toggle, post, galleryList, onReactionChange}) => {
  return (
    <Modal isOpen={modal} toggle={toggle} centered modalClassName="comment-model">
      <div>
        <div className="image-gallery">
          <Row className="m-0">
            <ImageGallery toggle={toggle} galleryList={galleryList}/>
            <Col xl="3" lg="4" className="p-0">
              <div className="comment-part theme-scrollbar">
                <UserHeading post={post}/>
                <div className="post-panel mb-0">
                  <div className="post-wrapper">
                    <div className="post-details">
                      <CommonLikePanel reactionCount={post?.reaction_counts} total_reactions={post?.total_reactions} commentCount={post?.total_comments} shareCount={post?.total_shares}/>
                      <CommonPostReact post={post} onReactionChange={onReactionChange} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null}/>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Modal>
  );
};

export default CommonGalleryModal;
