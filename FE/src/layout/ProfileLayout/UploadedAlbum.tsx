// components/UploadedAlbum.tsx
import { Col, Input, Label, Row, Spinner } from "reactstrap";
import CustomImage from "@/Common/CustomImage";
import { ImagePath } from "../../utils/constant";
import { FC, useEffect, useState, useRef } from "react";
import { TabPaneInterFace } from "../LayoutTypes";
import { imageService, CloudinaryImage } from "@/service/cloudinaryService";

const UploadedAlbum: FC<TabPaneInterFace> = ({ handleImageUrl, userid }) => {
  const defaultImages = [10, 9, 8, 7, 6, 5];
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchImagesRef = useRef(false);

  useEffect(() => {
    if (userid && !fetchImagesRef.current) {
      fetchImages();
      fetchImagesRef.current = true;
    }
  }, [userid]);

  const fetchImages = async () => {
    if (!userid) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await imageService.getImagesByUserId();
      
      if (response.success && response.data.length > 0) {
        setImages(response.data);
        setSelectedImage(response.data[0].url);
        handleImageUrl(response.data[0].url);
      } else {
        setImages([]);
        setSelectedImage("post/10.jpg");
        handleImageUrl("post/10.jpg");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setError("Failed to load images");
      setImages([]);
      setSelectedImage("post/10.jpg");
      handleImageUrl("post/10.jpg");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    handleImageUrl(imageUrl);
  };

  const handleDefaultImageSelect = (imageNumber: number) => {
    const imagePath = `post/${imageNumber}.jpg`;
    setSelectedImage(imagePath);
    handleImageUrl(imagePath);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2">Loading images...</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="alert alert-warning mb-3">
          <small>{error}. Using default images.</small>
        </div>
      )}

      {images.length > 0 ? (
        <Row className="gallery-photo ratio_landscape">
          {images.map((image, index) => (
            <Col key={image.id} sm="4" xs="6">
              <Label htmlFor={`uploaded-img-${image.id}`} />
              <Input
                className="radio_animated"
                onChange={() => handleImageSelect(image.url)}
                id={`uploaded-img-${image.id}`}
                type="radio"
                name="UploadedRadios"
                checked={selectedImage === image.url}
              />
              <div className="image-box">
                <div className="image blur-up lazyloaded">
                  <img
                    src={image.url}
                    className="img-fluid lazyload bg-img"
                    alt={`Uploaded image ${index + 1}`}
                    loading="lazy"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = `${ImagePath}/404/image_error.gif`;
                    }}
                    style={{
                      width: "100% !important",
                      height: "100% !important",
                      objectFit: "cover",
                    }}
                    />
                </div>
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        <Row className="gallery-photo ratio_landscape">
          {defaultImages.map((imageNumber, index) => (
            <Col key={imageNumber} sm="4" xs="6">
              <Label htmlFor={`default-img-${imageNumber}`} />
              <Input
                className="radio_animated"
                onChange={() => handleDefaultImageSelect(imageNumber)}
                id={`default-img-${imageNumber}`}
                type="radio"
                name="DefaultRadios"
                checked={selectedImage === `post/${imageNumber}.jpg`}
                defaultChecked={imageNumber === 10 && !selectedImage}
              />
              <div className="image-box">
                <div className="image bg-size blur-up lazyloaded">
                  <CustomImage
                    src={`${ImagePath}/post/${imageNumber}.jpg`}
                    className="img-fluid blur-up lazyload bg-img"
                    alt={`Default image ${imageNumber}`}
                  />
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default UploadedAlbum;