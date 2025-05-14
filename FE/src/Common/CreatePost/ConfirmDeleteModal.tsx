import React from "react";
import { Modal, ModalBody, ModalFooter, Button } from "reactstrap";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  toggle: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal = ({ isOpen, toggle, onConfirm }: ConfirmDeleteModalProps) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalBody>Bạn có chắc chắn muốn xóa bài viết này?</ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onConfirm}>Xóa</Button>
        <Button color="secondary" onClick={toggle}>Hủy</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmDeleteModal;
