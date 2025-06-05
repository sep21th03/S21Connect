// components/Album.tsx
import React, { FC, useState, useEffect } from "react";
import { Card, CardBody, Col, Input, Row, Spinner } from "reactstrap";
import DynamicFeatherIcon from "../DynamicFeatherIcon";
import { CreateAlbum, ImagePath } from "../../utils/constant";
import { AlbumInterFace } from "../CommonInterFace";
import { imageService, CloudinaryImage } from "@/service/cloudinaryService";
import { toast } from "react-toastify";

interface AlbumData {
  tittle: string;
  image: string;
  id?: string;
}

const Album: FC<AlbumInterFace> = ({
  showPhotos,
  setShowPhotos,
  lg,
  xl,
  userid,
}) => {
  const [albumDetail, setAlbumDetail] = useState<AlbumData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userid) {
      fetchAlbums();
    }
  }, [userid]);

  const fetchAlbums = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await imageService.getImagesByUserId();

      if (response.success && response.data.length > 0) {
        const albums = response.data.map((image: CloudinaryImage) => ({
          id: image.id,
          tittle:
            image.public_id
              .split("/")
              .pop()
              ?.replace(/\.\w+$/, "") || "Album",
          image: image.url,
        }));

        setAlbumDetail(albums);
      } else {
        setAlbumDetail([]);
      }
    } catch (error) {
      console.error("Error fetching albums:", error);
      setError("Failed to load albums");
      setAlbumDetail([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAlbums = () => {
    fetchAlbums();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userid) return;

    try {
      setIsLoading(true);
      const res = await imageService.uploadImage(file, userid);
      if (res && res.success) {
        await fetchAlbums();
      } else {
        toast.error(res?.message || "Có lỗi xảy ra khi upload hình.");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi upload hình.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Row className={`gallery-album ${showPhotos ? "d-none" : ""}`}>
        <Col className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2">Đang tải album...</p>
        </Col>
      </Row>
    );
  }

  return (
    <Row className={`gallery-album ${showPhotos ? "d-none" : ""}`}>
      <Col lg={lg} xl={xl} xs="6">
        <Card className="add-card">
          <div className="add-icon">
            <div>
              <DynamicFeatherIcon
                iconName="PlusCircle"
                className="iw-30 ih-30"
              />
              <Input
                onChange={(e) => {
                  handleChange(e);
                  e.target.value = "";
                }}
                type="file"
                className="form-control-file"
                accept="image/*"
              />
              <h5 className="card-title">{CreateAlbum}</h5>
              <p>Tạo album trong vài phút</p>
            </div>
          </div>
        </Card>
      </Col>
      <Col lg={lg} xl={xl} xs="6">
        <Card className="add-card">
          <div className="add-icon">
            <div onClick={refreshAlbums} style={{ cursor: "pointer" }}>
              <DynamicFeatherIcon
                iconName="RefreshCw"
                className="iw-30 ih-30"
              />
              <h5 className="card-title">Làm mới</h5>
              <p>Nhấn để làm mới</p>
            </div>
          </div>
        </Card>
      </Col>

      {error && (
        <Col xs="12">
          <div className="alert alert-warning">
            <small>{error}</small>
          </div>
        </Col>
      )}

      {albumDetail.length > 0
        ? albumDetail.map((data, index) => (
            <Col
              lg={lg}
              xl={xl}
              xs="6"
              key={data.id || index}
              onClick={() => setShowPhotos(!showPhotos)}
              style={{ cursor: "pointer" }}
            >
              <div className="card collection bg-size blur-up lazyloaded">
                <img
                  className="card-img-top img-fluid blur-up lazyload bg-img"
                  src={data.image}
                  alt={data.tittle}
                  loading="lazy"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = `${ImagePath}/404/image_error.gif`;
                  }}
                />
                <CardBody>
                  <h5 className="card-title">{data.tittle}</h5>
                  <h6>Album</h6>
                </CardBody>
              </div>
            </Col>
          ))
        : !isLoading && (
            <Col xs="12">
              <div className="text-center py-4">
                <p className="text-muted">
                  Không có album nào. Hãy tải lên ảnh để tạo album.
                </p>
              </div>
            </Col>
          )}
    </Row>
  );
};

export default Album;
