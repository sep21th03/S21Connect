"use client";
import { FC, useState, useEffect } from "react";
import { Col, Row, Spinner } from "reactstrap";
import CustomImage from '@/Common/CustomImage';
import { ImagePath } from '../../utils/constant/index';
import { useParams } from "next/navigation";
import axios from "axios";
import { usePageInfo } from "@/contexts/PageInfoContext";
import { Page } from "@/service/fanpageService";
import fanpageService from "@/service/fanpageService";

interface ImageData {
  id: string;
  url: string;
  created_at: string;
}

const PageGalleryPhotos: FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageInfo = usePageInfo() as unknown as Page;

  useEffect(() => {
    if (pageInfo?.id) {
      fetchPagePhotos();
    }
  }, [pageInfo?.id]);

  const fetchPagePhotos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fanpageService.getPageAlbum(pageInfo?.id);

      if (res && Array.isArray(res)) {
        setImages(res);
      } else {
        setImages([]);
      }
    } catch (err) {
      console.error(err);
      setError("Không thể tải ảnh của page.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2">Đang tải ảnh từ page...</p>
      </div>
    );
  }

  return (
    <div className="gallery-page-section section-b-space">
      <div className="card-title">
        <h3>Ảnh</h3>
      </div>
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
                  <CustomImage
                    src={image.url}
                    alt={`Page Image ${index + 1}`}
                    className="img-fluid blur-up lazyload bg-img"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = `${ImagePath}/404/image_error.gif`;
                    }}
                  />
                  {/* Có thể thêm menu dropdown nếu cần */}
                </div>
              </Col>
            ))
          ) : (
            <Col xs="12">
              <div className="text-center py-4">
                <p className="text-muted">Page này chưa có ảnh nào.</p>
              </div>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

export default PageGalleryPhotos;
