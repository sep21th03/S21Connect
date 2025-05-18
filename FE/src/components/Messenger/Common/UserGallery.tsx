import React, { useEffect, useState } from "react";
import { Href, ImagePath } from "../../../utils/constant/index";
import { Button, Col, Container, ModalBody, Modal, Row } from "reactstrap";
import CustomImage from "@/Common/CustomImage";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import Image from "next/image";

const UserGallery = ({ conversationId }: { conversationId: string }) => {
  const [allImages, setAllImages] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMedia = async (perPage: number) => {

      try {
        setLoading(true);
        const res = await axiosInstance.get(
          API_ENDPOINTS.MESSAGES.MESSAGES.GET_USER_GALLERY(conversationId),
          {
            params: { perPage: perPage },
          }
        );
        setAllImages(res.data);
        setLoading(false);

      } catch (err) {
        console.error("Failed to fetch media", err);
        setLoading(false);
      }
    };
    if (conversationId) {
      fetchMedia(3);
      if (isModalOpen) {
        fetchMedia(20);
      }
    }
    
  }, [isModalOpen, conversationId]);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <div className="user-gallery">
      <h5>
        media{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            toggleModal();
          }}
        >
          see all
        </a>
      </h5>
      <div className="gallery-section">
        <div className="portfolio-section ratio_square">
          <Container fluid className="p-0">
            <Row>
              {allImages.map((data, index) => (
                <Col xs="4" key={index}>
                  <div className="overlay">
                    <div className="portfolio-image">
                      <a href={Href}>
                        <Image
                          src={data.content}
                          alt="image"
                          className="img-fluid lazyload bg-img"
                          width={150}
                          height={150}
                        />
                      </a>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </div>
      </div>
      <Modal isOpen={isModalOpen} toggle={toggleModal} size="lg">
        <ModalBody>
          <Container>
            <Row>
              {allImages.map((data, idx) => (
                <Col xs="4" key={idx} className="mb-2">
                  <Image
                    src={data.content}
                    alt="image"
                    className="img-fluid rounded"
                    width={150}
                    height={150}
                  />
                </Col>
              ))}
            </Row>
            {loading && <div>Loading...</div>}
          </Container>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default UserGallery;
