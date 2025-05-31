import { FC, useState, useRef, useCallback } from "react";
import { Col, Container, Row } from "reactstrap";
import MultipleImage from "./common/MultipleImage";
import CommonGalleryModal from "@/Common/CommonGalleryModal";
import { PostImagesInterFace } from "../../Style1/Style1Types";

const PostImages: FC<PostImagesInterFace> = ({ post, onReactionChange }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const pauseAllVideos = useCallback(() => {
    videoRefs.current.forEach((video) => {
      if (video && !video.paused) {
        video.pause();
      }
    });
  }, []);

  const toggle = () => {
    if (!modalOpen) {
      pauseAllVideos();
    }
    setModalOpen(!modalOpen);
  };

  const registerVideoRef = useCallback((url: string, video: HTMLVideoElement | null) => {
    if (video) {
      videoRefs.current.set(url, video);
    } else {
      videoRefs.current.delete(url);
    }
  }, []);

  const imageList = Array.isArray(post.images)
    ? post.images
    : typeof post.images === "string"
    ? post.images.split("|").filter((x: string) => x.trim() !== "")
    : [];

  const videoList = Array.isArray(post.videos)
    ? post.videos
    : typeof post.videos === "string"
    ? post.videos.split("|").filter((x: string) => x.trim() !== "")
    : [];

  const mediaList = [...videoList, ...imageList];
  const galleryList = [
    ...videoList.map((url: string) => ({ url, type: "video" })),
    ...imageList.map((url: string) => ({ url, type: "image" })),
  ];
  const moreImageCount = imageList.length - 3;
  const isVideoUrl = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

  return (
    <div className="img-wrapper">
      <div className="gallery-section">
        <div className="portfolio-section ratio_square">
          <Container fluid className="p-0">
            <Row>
              {mediaList[0] && (
                <Col xs="8" className="pt-cls" onClick={toggle}>
                  <MultipleImage 
                    mediaUrl={mediaList[0]} 
                    registerVideoRef={isVideoUrl(mediaList[0]) ? registerVideoRef : undefined}
                  />
                </Col>
              )}
              <Col xs="4" className="row m-0">
                {mediaList[1] && (
                  <Col xs="12" className="pt-cls p-0" onClick={toggle}>
                    <MultipleImage 
                      mediaUrl={mediaList[1]} 
                      registerVideoRef={isVideoUrl(mediaList[1]) ? registerVideoRef : undefined}
                    />
                  </Col>
                )}
                {mediaList[2] && (
                  <Col xs="12" className="pt-cls p-0" onClick={toggle}>
                    <MultipleImage
                      mediaUrl={mediaList[2]}
                      moreImage={moreImageCount > 0}
                      moreImageCount={moreImageCount}
                      registerVideoRef={isVideoUrl(mediaList[2]) ? registerVideoRef : undefined}
                    />
                  </Col>
                )}
              </Col>
            </Row>
            <CommonGalleryModal
              toggle={toggle}
              modal={modalOpen}
              post={post}
              galleryList={galleryList}
              onReactionChange={onReactionChange}
            />
          </Container>
        </div>
      </div>
    </div>
  );
};

export default PostImages;