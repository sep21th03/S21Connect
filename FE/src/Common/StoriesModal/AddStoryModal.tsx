import { FC, useState } from "react";
import { Col, Modal, ModalBody, Button } from "reactstrap";
import { Story } from "../CommonInterFace";
import { Href, ImagePath } from '../../utils/constant/index';

interface AddStoryModalProps {
  isOpen: boolean;
  toggle: () => void;
  onAddStory: (type: 'text' | 'media') => void;
}

const AddStoryModal: FC<AddStoryModalProps> = ({ isOpen, toggle, onAddStory }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalBody className="text-center p-4">
        <h5 className="mb-4">Chọn loại bảng tin</h5>
        <div className="d-flex gap-3 justify-content-center">
          <Button 
            color="primary" 
            className="d-flex flex-column align-items-center p-3"
            onClick={() => {
              onAddStory('text');
              toggle();
            }}
          >
            <i className="fa fa-font mb-2" style={{fontSize: '24px'}}></i>
            <span>Thêm văn bản</span>
          </Button>
          <Button 
            color="success" 
            className="d-flex flex-column align-items-center p-3"
            onClick={() => {
              onAddStory('media');
              toggle();
            }}
          >
            <i className="fa fa-image mb-2" style={{fontSize: '24px'}}></i>
            <span>Thêm ảnh/video</span>
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default AddStoryModal;