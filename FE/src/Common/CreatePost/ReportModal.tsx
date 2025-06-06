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
import {Reason} from "@/components/NewsFeed/Style1/Style1Types";


interface ReportModalProps {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (data: { reason_code: string; reason_text?: string }) => Promise<void> | void;
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

  const handleSubmit = async () => {
    if (!selectedReason) return;
    await onSubmit({
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
              <option key={reason.reason_code} value={reason.reason_code}>
                {reason.reason_text}
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
