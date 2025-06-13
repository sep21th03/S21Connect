"use client";
import React, { useEffect, useState } from "react";
import CommonLayout from "@/layout/CommonLayout";
import { Container, Row, Col, Card, CardBody, Button, ModalFooter, Input, FormGroup, Form, Modal, ModalBody, Label, ModalHeader, Alert } from "reactstrap";
import SpaySideBar from "@/layout/CommonLayout/FullSideBar/SpaySideBar";
import styles from "@/style/invoiceCard.module.css";
import { Bank, fetchBanks } from "@/service/mockupSercive";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { toast } from "react-toastify";


interface Disbursement {
  id: string;
  username: string;
  account_bank: string;
  account_number: string;
  sotiens: number;
  created_at: string;
  updated_at: string;
}

const DisbursementPage = () => {
  const [reloadBill, setReloadBill] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [account_bank, setAccountBank] = useState("");
  const [account_number, setAccountNumber] = useState("");
  const [sotiens, setSotiens] = useState(0);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [disbursement, setDisbursement] = useState<Disbursement[]>([]);

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleReload = () => {
    setReloadBill(!reloadBill);
  };

  useEffect(() => {
    fetchBanks().then(setBanks);
  }, []);

  useEffect(() => {
    fetchDisbursement();
  }, [reloadBill]);

  const fetchDisbursement = async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.PAYMENT.BILL.GET_DISBURSEMENT);
    if (response.status === 200) {
      setDisbursement(response.data.data);
    }
  };

  const handleCreateDisbursement = async () => {
    const response = await axiosInstance.post(API_ENDPOINTS.PAYMENT.BILL.CREATE_DISBURSEMENT, {
      account_bank,
      account_number,
      sotiens,
    });
    if (response.status === 200) {
      setReloadBill(!reloadBill);
      toggleModal();
      toast.success("Tạo yêu cầu rút tiền thành công");
    }
  };

  return (
    <CommonLayout mainClass="spay-page custom-padding" loaderName="payment">
      <SpaySideBar />
      <Container fluid className="section-t-space">
        <Row className="mt-4">
          <Col xl="12" xxl="12">
            <Card className={`${styles.styleCard}`}>
              <div
                className={`${styles.CardHeader} d-flex justify-content-between align-items-center`}
              >
                <h4 className={`${styles.cardTitle} mb-0`}>
                  Danh Sách Rút Tiền{" "}
                  <a
                    className="change-btn active"
                    href="#"
                    onClick={handleReload}
                    title="Tải lại dữ liệu"
                  >
                    <span className="reload-icon">
                      <i className="fas fa-sync-alt reload_bill active"></i>
                    </span>
                  </a>
                </h4>
                <Button
                  className={`${styles.cartBtn_primary} btn-rounded btn-md`}
                  onClick={toggleModal}
                >
                  Tạo Yêu Cầu Rút Tiền
                </Button>
              </div>
              <CardBody>
                <div className="table-responsive">
                  <table id="list_bill" className="display table">
                    <thead>
                      <tr>
                        <th className={`${styles.thLight} fw-normal`}>ID</th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Username
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Số Tài Khoản
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Ngân Hàng
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Tên Tài Khoản
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Số Tiền
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Ngày Rút
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Trạng Thái
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Cập Nhật Cuối
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Qr Code
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Hành Động
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {disbursement.map((item: Disbursement, index: number) => (
                        <tr key={index}>
                          <td>{item.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <Modal isOpen={modalOpen} toggle={toggleModal} centered size="lg">
      <ModalHeader toggle={toggleModal}>Tạo Yêu Cầu Rút Tiền Mới</ModalHeader>
      <ModalBody>
        <Alert color="warning" className="d-flex align-items-center">
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="me-2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <strong>Lưu ý!</strong> Hệ thống chỉ duyệt yêu cầu khi họ tên chủ tài khoản trùng với tên tài khoản của bạn.
          </div>
        </Alert>

        <Form>
          <FormGroup>
            <Label for="account_bank">Chọn Ngân Hàng:</Label>
            <Input
              type="select"
              id="account_bank"
              value={account_bank}
              onChange={(e) => setAccountBank(e.target.value)}
            >
              <option value="">Chọn Ngân Hàng</option>
              {banks.map((bank: Bank, index: number) => (
                <option key={index} value={bank.name}>
                  {bank.name}
                </option>
              ))}
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="account_number">Số Tài Khoản</Label>
            <Input
              type="text"
              id="account_number"
              value={account_number}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Nhập số tài khoản"
            />
          </FormGroup>

          <FormGroup>
            <Label for="sotiens">Số Tiền</Label>
            <Input
              type="number"
              id="sotiens"
              value={sotiens}
              onChange={(e) => setSotiens(Number(e.target.value))}
              placeholder="Nhập số tiền"
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggleModal}>
          Đóng
        </Button>
        <Button color="primary" onClick={handleCreateDisbursement}>
          Tạo Yêu Cầu
        </Button>
      </ModalFooter>
    </Modal>
    </CommonLayout>
  );
};

export default DisbursementPage;
