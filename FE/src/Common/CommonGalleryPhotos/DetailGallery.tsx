import React, { FC, useState, useEffect } from "react";
import { Col, Row, Spinner } from "reactstrap";
import CustomImage from '@/Common/CustomImage';
import CommonGalleryDropDowns from "./CommonGalleryDropDowns";
import { Href, ImagePath } from '../../utils/constant/index';
import { imageService } from "@/service/cloudinaryService";

interface DetailGalleryProps {
  setShowPhotos: (show: boolean) => void;
  showPhotos: boolean;
  selectedFolder?: string;
  userid: string;
}

interface ImageData {
  id: string;
  url: string;
  folder: string;
  created_at: string;
}

const DetailGallery: FC<DetailGalleryProps> = ({ 
  setShowPhotos, 
  showPhotos, 
  selectedFolder,
  userid 
}) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log("images:", selectedFolder);
  useEffect(() => {
    if (showPhotos && selectedFolder && userid) {
      fetchAlbumImages();
    }
  }, [showPhotos, selectedFolder, userid]);

  const fetchAlbumImages = async () => {
    if (!selectedFolder || !userid) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await imageService.getAlbumImages(userid, selectedFolder);
      
      if (response && Array.isArray(response)) {
        setImages(response);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error("Error fetching album images:", error);
      setError("Không thể tải ảnh từ album");
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showPhotos) {
    return null;
  }

  return (
    <div className={`portfolio-section ${showPhotos ? "" : "d-none"}`}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Album: {selectedFolder}</h4>
        <button 
          className="btn btn-secondary"
          onClick={() => setShowPhotos(false)}
        >
          ← Quay lại
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2">Đang tải ảnh...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-warning text-center">
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
          !isLoading && (
            <Col xs="12">
              <div className="text-center py-4">
                <p className="text-muted">
                  Không có ảnh nào trong album này.
                </p>
              </div>
            </Col>
          )
        )}
      </Row>
    </div>
  );
};

export default DetailGallery;