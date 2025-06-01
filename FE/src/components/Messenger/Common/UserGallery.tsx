import React, { useEffect, useState } from "react";
import { Href } from "../../../utils/constant/index";
import { Button, Col, Container, ModalBody, Modal, Row } from "reactstrap";
import Image from "next/image";
import { getUserGalleryMessage } from "@/service/messageService";


const UserGallery = ({ conversationId }: { conversationId: string }) => {
  const [allImages, setAllImages] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  
  const fetchGallery = async (perPage: number) => {
    try {
      setLoading(true);
      const images = await getUserGalleryMessage(conversationId, perPage);
      setAllImages(images);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!conversationId) return;
    fetchGallery(isModalOpen ? 20 : 3);
  }, [isModalOpen, conversationId]);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <div className="user-gallery">
      <h5>
        Ảnh{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            toggleModal();
          }}
        >
          Xem tất cả
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
