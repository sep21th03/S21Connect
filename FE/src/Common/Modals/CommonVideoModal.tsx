import { FC } from "react";
import { Modal, ModalBody } from "reactstrap";
import { CommonVideoModalInterFace } from "../CommonInterFace";

const CommonVideoModal: FC<CommonVideoModalInterFace> = ({
  modal,
  toggle,
  videoUrl,
}) => {
  return (
    <Modal
      isOpen={modal}
      toggle={toggle}
      modalClassName="bd-example-modal-lg"
      centered
      size="lg"
    >
      <ModalBody className="video-model">
        <video
          className="video"
          src={videoUrl}
          controls
          width="100%"
          height="auto"
        >
          <source src={videoUrl} type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      </ModalBody>
    </Modal>
  );
};

export default CommonVideoModal;
