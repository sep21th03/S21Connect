import React, { FC, useState, useEffect } from "react";
import { Card, CardBody, Col, Input, Row, Spinner } from "reactstrap";
import DynamicFeatherIcon from "../DynamicFeatherIcon";
import { CreateAlbum, ImagePath } from "../../utils/constant";
import { AlbumInterFace } from "../CommonInterFace";
import { imageService } from "@/service/cloudinaryService";
import { toast } from "react-toastify";

interface AlbumData {
  folder: string;
  count: number;
  latest: string;
  thumbnail: string;
}

interface DetailGalleryProps {
  setShowPhotos: (show: boolean) => void;
  showPhotos: boolean;
  selectedFolder?: string;
  setSelectedFolder?: (folder: string) => void;
}

const Album: FC<
  AlbumInterFace & { setSelectedFolder?: (folder: string) => void }
> = ({ showPhotos, setShowPhotos, lg, xl, userid, setSelectedFolder }) => {
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

      const response = await imageService.getAlbums(userid);
      if (response && response.length > 0) {
        setAlbumDetail(response);
      } else {
        setAlbumDetail([]);
      }
    } catch (error) {
      console.error("Lỗi tải album:", error);
      setError("Tải album thất bại");
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
        toast.success("Upload hình thành công!");
      } else {
        toast.error(res?.message || "Có lỗi xảy ra khi upload hình.");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi upload hình.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlbumClick = (folder: string) => {
    if (setSelectedFolder) {
      setSelectedFolder(folder);
    }
    setShowPhotos(true);
  };

  const getAlbumTitle = (folder: string) => {
    switch (folder) {
      case "avatars":
      case "/avatars":
        return "Ảnh đại diện";
      case "cover_photos":
        return "Ảnh bìa";
      case "album":
        return "Album cá nhân";
      case "post":
        return "Ảnh bài viết";
      default:
        return folder
          .replace(/[_-]/g, " ")
          .replace(/^\/+/, "")
          .replace(/\b\w/g, (l) => l.toUpperCase());
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
          <div className="alert alert-warning text-center">
            <small>{error}</small>
          </div>
        </Col>
      )}

      {albumDetail.length > 0
        ? albumDetail.map((album, index) => (
            <Col
              lg={lg}
              xl={xl}
              xs="6"
              key={album.folder || index}
              onClick={() => handleAlbumClick(album.folder)}
              style={{ cursor: "pointer" }}
            >
              <div className="card collection bg-size blur-up lazyloaded">
                <div className="p-2 text-center">
                  <h5 className="card-title mb-2">{getAlbumTitle(album.folder)}</h5>
                </div>

                <img
                  className="card-img-top img-fluid blur-up lazyload bg-img"
                  src={album.thumbnail || `${ImagePath}/404/image_error.gif`}
                  alt={album.folder}
                  loading="lazy"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = `${ImagePath}/404/image_error.gif`;
                  }}
                />

                <CardBody className="text-center">
                  <h6>{album.count} ảnh</h6>
                  <small className="text-muted">
                    Cập nhật:{" "}
                    {new Date(album.latest).toLocaleDateString("vi-VN")}
                  </small>
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
