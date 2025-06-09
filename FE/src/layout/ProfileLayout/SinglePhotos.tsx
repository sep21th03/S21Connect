import React, { FC, useEffect, useState } from "react";
import { CloseAlbum, ImagePath } from "../../utils/constant/index";
import { Col, Input, Label, Row, Spinner } from "reactstrap";
import { SinglePhotosInterFace } from "../LayoutTypes";
import CustomImage from "@/Common/CustomImage";
import { imageService, CloudinaryImage } from "@/service/cloudinaryService";

const SinglePhotos: FC<SinglePhotosInterFace> = ({
  showPhotos,
  setShowPhotos,
  handleImageUrl,
  userid,
}) => {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchImagesRef = React.useRef(false);

  useEffect(() => {
    if (showPhotos && !fetchImagesRef.current && userid) {
      fetchImages();
      fetchImagesRef.current = true;
    }
  }, [showPhotos, userid]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await imageService.getImagesByUserId();

      if (response.success && response.data.length > 0) {
        setImages(response.data);
        setSelectedImage(response.data[0].url);
        handleImageUrl(response.data[0].url, response.data[0].id);
      } else {
        setImages([]);
        setSelectedImage(null);
        handleImageUrl("post/1.jpg", "");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setError("Failed to load images");
      setImages([]);
      setSelectedImage(null);
      handleImageUrl("post/1.jpg", "");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (image: CloudinaryImage) => {
    setSelectedImage(image.url);
    handleImageUrl(image.url, image.id);
  };

  const handleDefaultImageSelect = (imageNumber: number) => {
    const imagePath = `post/${imageNumber}.jpg`;
    setSelectedImage(imagePath);
    handleImageUrl(imagePath, "");
  };

  const defaultImages = [1, 2, 3, 4, 5, 6];

  const refreshImages = () => {
    fetchImagesRef.current = false;
    fetchImages();
  };

  return (
    <div className={`gallery-open ${showPhotos ? "d-block" : ""}`}>
      <div className="close-album" onClick={() => setShowPhotos(!showPhotos)}>
        <h5>{CloseAlbum}</h5>
      </div>

      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h5>Ảnh trong album</h5>
        <div>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={refreshImages}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" /> Đang tải...
              </>
            ) : (
              "Làm mới"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning mb-3">
          <small>{error}. Sử dụng ảnh mặc định.</small>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2">Đang tải ảnh...</p>
        </div>
      ) : images.length > 0 ? (
        <Row className="gallery-photo ratio_landscape">
          {images.map((image) => (
            <Col sm="4" xs="6" key={image.id}>
              <Label htmlFor={`chkAni${image.id}`} />
              <Input
                className="radio_animated"
                id={`chkAni${image.id}`}
                type="radio"
                onChange={() => handleSelect(image)}
                name="Radios1"
                checked={selectedImage === image.url}
              />
              <div className="image-box">
                <div className="image blur-up lazyloaded">
                  <img
                    src={image.url}
                    alt="image"
                    className="img-fluid lazyload bg-img"
                    loading="lazy"
                  />
                </div>
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        <Row className="gallery-photo ratio_landscape">
          {defaultImages.map((imageNumber) => (
            <Col sm="4" xs="6" key={imageNumber}>
              <Label htmlFor={`chkAni${imageNumber}`} />
              <Input
                className="radio_animated"
                id={`chkAni${imageNumber}`}
                type="radio"
                onChange={() => handleDefaultImageSelect(imageNumber)}
                name="Radios1"
                checked={selectedImage === `post/${imageNumber}.jpg`}
                defaultChecked={imageNumber === 1 && !selectedImage}
              />
              <div className="image-box">
                <div className="image bg-size blur-up lazyloaded">
                  <CustomImage
                    src={`${ImagePath}/post/${imageNumber}.jpg`}
                    alt={`Default image ${imageNumber}`}
                    className="img-fluid blur-up lazyload bg-img"
                  />
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default SinglePhotos;
