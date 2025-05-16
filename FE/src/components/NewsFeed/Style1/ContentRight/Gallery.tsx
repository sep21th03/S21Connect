import { FC, Fragment, useState, useEffect } from "react";
import GalleryTop from "./GalleryTop";
import { Col, Container, Row } from "reactstrap";
import CommonGalleryImage from "./common/CommonGallleryImage";
import CommonGalleryModal from "@/Common/CommonGalleryModal";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";

interface Gallery {
  id: number;
  created_at: string;
  updated_at: string;
  row: boolean;
  sizeSmall: number;
  className: string;
  url: string;
}

const Gallery: FC = () => {
  const [galleryModal, setGalleryModal] = useState(false);
  const toggleGalleryModal = () => setGalleryModal(!galleryModal);
  const [gallery, setGallery] = useState<Gallery[]>([]);

  useEffect(() => {
    const fetchGallery = async () => {
      const response = await axiosInstance.get<ApiResponse<Gallery[]>>(API_ENDPOINTS.IMAGES.GET_BY_ID("112"));
      setGallery(response.data.data);
    };
    fetchGallery();
  }, []);
  return (
    <div className="gallery-section section-t-space">
      <GalleryTop galleryLength={gallery.length}/>
      <div className="portfolio-section ratio_square">
        <Container fluid className="p-0">
          <Row>
            {gallery.map((item, index) => (
              <Fragment key={index}>
                {item.row ? (
                  <Col xs="4" className="row m-0">
                    <Col xs="12" className="pt-cls p-0">
                      <CommonGalleryImage imageUrl={item.url} onClickHandle={toggleGalleryModal}/>
                    </Col>
                    <Col xs="12" className="pt-cls p-0">
                      <CommonGalleryImage imageUrl={item.url} onClickHandle={toggleGalleryModal}/>
                    </Col>
                  </Col>
                ) : (
                  <Col xs={item.sizeSmall} className={item.className?item.className:""}>
                    <CommonGalleryImage imageUrl={item.url} onClickHandle={toggleGalleryModal}/>
                  </Col>
                )}
              </Fragment>
            ))}
          </Row>
        </Container>
      </div>
      <CommonGalleryModal modal={galleryModal} toggle={toggleGalleryModal} />
    </div>
  );
};

export default Gallery;
