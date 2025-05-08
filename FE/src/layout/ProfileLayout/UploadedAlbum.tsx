import { Col, Input, Label, Row, Spinner } from "reactstrap";
import CustomImage from "@/Common/CustomImage";
import { ImagePath } from "../../utils/constant";
import { FC, useEffect, useState } from "react";
import { TabPaneInterFace } from "../LayoutTypes";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";

interface CloudinaryImage {
  id: string;
  url: string;
  public_id: string;
  type: string;
  created_at: string;
}

const UploadedAlbum: FC<TabPaneInterFace> = ({ handleImageUrl, userid }) => {
  let datas = [10, 9, 8, 7, 6, 5];
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    fetchImages();
  });

  const fetchImages = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.IMAGES.GET_BY_ID(userid)}`
      );
      if (response.data.success && response.data.data.length > 0) {
        setImages(response.data.data);
        setSelectedImage(response.data.data[0].url);
        handleImageUrl(response.data.data[0].url);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {loading ? (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2">Loading images...</p>
        </div>
      ) : images.length > 0 ? (
        <Row className="gallery-photo ratio_landscape">
          {images.map((image, index) => (
            <Col key={index} sm="4" xs="6">
              <Label htmlFor="chk-ani1" />
              <Input
                className="radio_animated"
                onChange={() => handleImageUrl(image.url)}
                id="chk-ani1"
                type="radio"
                name="Radios"
                defaultChecked={image.url === selectedImage ? true : false}
              />
              <div className="image-box">
                <div className="image bg-size blur-up lazyloaded">
                  <CustomImage
                    src={image.url}
                    className="img-fluid blur-up lazyload bg-img d-none"
                    alt=""
                  />
                </div>
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        <Row className="gallery-photo ratio_landscape">
          {datas.map((data, index) => (
            <Col key={index} sm="4" xs="6">
              <Label htmlFor="chk-ani1" />
              <Input
                className="radio_animated"
                onChange={() => handleImageUrl(`post/${data}.jpg`)}
                id="chk-ani1"
                type="radio"
                name="Radios"
                defaultChecked={data === 10 ? true : false}
              />
              <div className="image-box">
                <div className="image bg-size blur-up lazyloaded">
                  <CustomImage
                    src={`${ImagePath}/post/${data}.jpg`}
                    className="img-fluid blur-up lazyload bg-img d-none"
                    alt=""
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
