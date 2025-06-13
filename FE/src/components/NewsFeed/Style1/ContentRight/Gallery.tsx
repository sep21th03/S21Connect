import { FC, Fragment, useState, useEffect } from "react";
import GalleryTop from "./GalleryTop";
import { Col, Container, Row } from "reactstrap";
import CommonGalleryImage from "./common/CommonGallleryImage";
import CommonGalleryModal from "@/Common/CommonGalleryModal";
import { imageService } from "@/service/cloudinaryService";

interface Gallery {
  id: string;
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
      const response = await imageService.getImagesByUserId();
      setGallery(response.data.map(image => ({
        id: image.id,
        created_at: image.created_at,
        updated_at: image.updated_at,
        row: false,
        sizeSmall: 4, 
        className: "",
        url: image.url
      })));
    };
    fetchGallery();
  }, []);

  const displayImages = gallery.slice(0, 9);
  const remainingCount = gallery.length - 9;
  
  return (
    <div className="gallery-section section-t-space">
      <GalleryTop galleryLength={gallery.length}/>
      <div className="portfolio-section ratio_square">
        <Container fluid className="p-0">
          <Row>
            {displayImages.map((item, index) => (
              <Col xs="4" key={index} className="p-1">
                <div className="position-relative">
                  <CommonGalleryImage 
                    imageUrl={item.url} 
                    onClickHandle={toggleGalleryModal}
                  />
                  {index === 8 && remainingCount > 0 && (
                    <div 
                      className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
                      style={{
                        top: 0,
                        left: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      onClick={toggleGalleryModal}
                    >
                      +{remainingCount}
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
      {/* <CommonGalleryModal modal={galleryModal} toggle={toggleGalleryModal} post={null as any} galleryList={[]} onReactionChange={() => {}} /> */}
    </div>
  );
};

export default Gallery;