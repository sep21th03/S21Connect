import { FC, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import MultipleImage from "./common/MultipleImage";
import CommonGalleryModal from "@/Common/CommonGalleryModal";

interface PostImagesProps {
  images: {
    images: string | string[];
  };
}

const PostImageShare: FC<PostImagesProps> = ({ images }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const toggle = () => setModalOpen(!modalOpen);

  const imageList = Array.isArray(images.images)
    ? images.images
    : typeof images.images === "string"
    ? images.images.split("|")
    : [];

  const moreImageCount = imageList.length - 3;

  if (!imageList.length) return null;

  return (
    <div className="img-wrapper">
      <div className="gallery-section">
        <div className="portfolio-section ratio_square">
          <Container fluid className="p-0">
            <Row>
              {imageList[0] && (
                <Col xs="8" className="pt-cls" onClick={toggle}>
                  <MultipleImage imageUrl={imageList[0]} />
                </Col>
              )}
              <Col xs="4" className="row m-0">
                {imageList[1] && (
                  <Col xs="12" className="pt-cls p-0" onClick={toggle}>
                    <MultipleImage imageUrl={imageList[1]} />
                  </Col>
                )}
                {imageList[2] && (
                  <Col xs="12" className="pt-cls p-0" onClick={toggle}>
                    <MultipleImage
                      imageUrl={imageList[2]}
                      moreImage={moreImageCount > 0}
                      moreImageCount={moreImageCount}
                    />
                  </Col>
                )}
              </Col>
            </Row>
            <CommonGalleryModal toggle={toggle} modal={modalOpen} />
          </Container>
        </div>
      </div>
    </div>
  );
};

export default PostImageShare;
