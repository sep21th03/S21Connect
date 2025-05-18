import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";

interface Reason {
  value: string;
  label: string;
}

interface ReportModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (data: { reason_code: string; reason_text?: string }) => void;
  reasons: Reason[];
}

const ReportModal = ({
  isOpen,
  toggle,
  onSubmit,
  reasons,
}: ReportModalProps) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedReason("");
      setCustomReason("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!selectedReason) return;
    onSubmit({
      reason_code: selectedReason,
      reason_text: customReason.trim() || undefined,
    });
    toggle();
  };
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Báo cáo nội dung</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="reason">Chọn lý do</Label>
          <Input
            type="select"
            id="reason"
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
          >
            <option value="">-- Chọn một lý do --</option>
            {reasons.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="customReason">Mô tả thêm (tùy chọn)</Label>
          <Input
            type="textarea"
            id="customReason"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Nhập mô tả nếu có..."
            maxLength={255}
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          onClick={handleSubmit}
          disabled={!selectedReason}
        >
          Gửi báo cáo
        </Button>
        <Button color="secondary" onClick={toggle}>
          Hủy
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ReportModal;
