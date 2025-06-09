import React, { FC, useState, useEffect } from "react";
import { Col, Row, Spinner } from "reactstrap";
import CustomImage from '@/Common/CustomImage';
import CommonGalleryDropDowns from "./CommonGalleryDropDowns";
import { Href, ImagePath } from '../../utils/constant/index';
import { imageService } from "@/service/cloudinaryService";
import { useSession } from "next-auth/react";

interface ImageData {
  id: string;
  url: string;
  folder: string;
  created_at: string;
}

const PhotosTab: FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const userid = session?.user?.id || "defaultUser";

  useEffect(() => {
    if (userid) {
      fetchAllPhotos();
    }
  }, [userid]);

  const fetchAllPhotos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await imageService.getAllPhotos(userid);
      
      if (response && Array.isArray(response)) {
        setImages(response);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error("Error fetching all photos:", error);
      setError("Không thể tải ảnh");
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2">Đang tải ảnh...</p>
      </div>
    );
  }

  return (
    <div className="portfolio-section">
      {error && (
        <div className="alert alert-warning text-center mb-3">
          <small>{error}</small>
        </div>
      )}

      <Row className="ratio_square">
        {images.length > 0 ? (
          images.map((image, index) => (
            <Col xl="3" lg="4" xs="6" key={image.id || index}>
              <div className="portfolio-image">
                <a href={Href}>
                  <CustomImage
                    src={image.url}
                    alt={`Image ${index + 1}`}
                    className="img-fluid blur-up lazyload bg-img"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = `${ImagePath}/404/image_error.gif`;
                    }}
                  />
                </a>
                <CommonGalleryDropDowns />
              </div>
            </Col>
          ))
        ) : (
          <Col xs="12">
            <div className="text-center py-4">
              <p className="text-muted">
                Không có ảnh nào. Hãy tải lên ảnh để xem.
              </p>
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default PhotosTab;