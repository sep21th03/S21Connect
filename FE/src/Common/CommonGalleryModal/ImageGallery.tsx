import { Href } from "../../utils/constant";
import Image from "next/image";
import { FC, useRef, useEffect } from "react";
import Slider from "react-slick";
import { Col } from "reactstrap";
import { ImageGalleryInterFace } from "../CommonInterFace";
import DynamicFeatherIcon from "../DynamicFeatherIcon";

const ImageGallery: FC<ImageGalleryInterFace> = ({ toggle, galleryList }) => {
  const modalVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    return () => {
      modalVideoRefs.current.forEach((video) => {
        if (video && !video.paused) {
          video.pause();
        }
      });
    };
  }, []);

  const handleVideoRef = (url: string, video: HTMLVideoElement | null) => {
    if (video) {
      modalVideoRefs.current.set(url, video);
    } else {
      modalVideoRefs.current.delete(url);
    }
  };

  const handleCloseModal = (e: React.MouseEvent) => {
    e.preventDefault();
    modalVideoRefs.current.forEach((video) => {
      if (video && !video.paused) {
        video.pause();
      }
    });
    toggle();
  };

  return (
    <Col xl={9} lg={8} className="p-0">
      <a href={Href} onClick={handleCloseModal}>
        <DynamicFeatherIcon 
          iconName="X" 
          className="icon-light close-btn" 
        />
      </a>
      <Slider className="slide-1 box-arrow dots-number">
        {galleryList?.map((data, index) => (
          <div key={index}>
            <div style={{ width: "100%", display: "inline-block" }}>
              <div className="img-part">
                {data.type === "image" ? (
                  <Image 
                    width={1165} 
                    height={775} 
                    src={data.url} 
                    className="img-fluid blur-up lazyloaded" 
                    alt="image"
                  />
                ) : (
                  <video 
                    ref={(ref) => handleVideoRef(data.url, ref)}
                    src={data.url} 
                    className="img-fluid blur-up lazyloaded" 
                    controls
                    preload="metadata"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </Col>
  );
};

export default ImageGallery;