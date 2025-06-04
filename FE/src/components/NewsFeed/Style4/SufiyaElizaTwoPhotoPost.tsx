import CommonLikePanel from "@/Common/CommonLikePanel";
import CommonPostReact from "@/Common/CommonPostReact";
import CommonUserHeading from "@/Common/CommonUserHeading";
import DetailBox from "@/Common/DetailBox";
import { BirthdayHeading, BirthdaySpan } from "../../../utils/constant";
import { Col, Container, Row } from "reactstrap";
import MultipleImage from "../Style3/ContentCenter/common/MultipleImage";
import { FC, useState } from "react";
import CommonGalleryModal from "@/Common/CommonGalleryModal";
import { SufiyaElizaTwoPhotoPostInterFace } from "../Style1/Style1Types";

const SufiyaElizaTwoPhotoPost:FC<SufiyaElizaTwoPhotoPostInterFace>  = ({diffrentImage}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const toggle = () => setModalOpen(!modalOpen);
  return (
    <div className="post-wrapper col-grid-box section-t-space d-block">
      <CommonUserHeading  id="SufiyaElizaTwoPhotoPost" postUser={null as any} onPostUpdated={() => {}} onPostDeleted={() => {}} isShared={false}/>
      <div className="post-details">
        <div className="img-wrapper">
          <div className="gallery-section">
            <div className="portfolio-section ratio_square">
              <Container fluid className="p-0">
                <Row>
                  <Col xs="6" onClick={toggle}>
                    <MultipleImage mediaUrl={null as any} moreImage={null as any} moreImageCount={null as any} registerVideoRef={null as any} />
                  </Col>
                  <Col xs="6" className="m-0" onClick={toggle}>
                    <MultipleImage mediaUrl={null as any} moreImage={null as any} moreImageCount={null as any} registerVideoRef={null as any} />
                  </Col>
                </Row>
                <CommonGalleryModal toggle={toggle} modal={modalOpen} post={null as any} galleryList={null as any} onReactionChange={() => {}}/>
              </Container>
            </div>
          </div>
        </div>
        <DetailBox heading={BirthdayHeading} span={BirthdaySpan} post={null as any} />
        <CommonLikePanel reactionCount={null as any} total_reactions={null as any} commentCount={null as any} shareCount={null as any}/>
        <CommonPostReact post={null as any} onReactionChange={() => {}} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null}/>
      </div>
    </div>
  );
};

export default SufiyaElizaTwoPhotoPost;
