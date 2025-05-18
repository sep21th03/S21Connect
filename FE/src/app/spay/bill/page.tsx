"use client";
import React, { useState, useEffect } from "react";
import CommonLayout from "@/layout/CommonLayout";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
  Input,
  ModalBody,
  ModalFooter,
  FormGroup,
  Form,
  ModalHeader,
  Modal,
  ButtonGroup,
  UncontrolledTooltip,
} from "reactstrap";
import SpaySideBar from "@/layout/CommonLayout/FullSideBar/SpaySideBar";
import styles from "@/style/invoiceCard.module.css";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import {
  formatTimeAgo,
  formatTimeAgoCreate,
} from "@/utils/formatTime";
import { renderStatusBadge } from "@/utils/formatStatus";
import { copyLink } from "@/utils";
import Swal from "sweetalert2";

interface Bill {
  bill_id: string;
  id: string;
  amount: number;
  note: string;
  status: string;
  payment_method: string;
  shop: string;
  username: string;
  created_at: number;
  updated_at: string;
  share: string;
  action: string;
}
export const renderShareButton = (id: string, sotien: number) => {
  return (
    <Button color="primary" size="sm" onClick={() => copyLink(id, sotien)}>
      <i className="fas fa-share"></i>
    </Button>
  );
};

const BillPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [billData, setBillData] = useState<Bill[]>([]);
  const [reloadCount, setReloadCount] = useState(0);

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleReload = () => {
    setReloadCount((prev) => prev + 1);
  };

  useEffect(() => {
    fetchBillData();
  }, [reloadCount]);

  const fetchBillData = async () => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.PAYMENT.BILL.GET_LIST
    );
    if (response.status === 200) {
      setBillData(response.data.data);
    }
  };
  useEffect(() => {
    fetchBillData();
  }, [reloadCount]);

  const deleteHoadon = async (bill_id: string) => {
    const response = await axiosInstance.delete(
      API_ENDPOINTS.PAYMENT.BILL.DELETE(bill_id)
    );
    if (response.status === 200) {
      Swal.fire({
        title: "Thành công",
        text: "Hóa đơn đã được xóa thành công",
        icon: "success",
      });
      setReloadCount((prev) => prev + 1);
    }
  };

  const payHoadon = async (bill_id: string) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.PAYMENT.BILL.PAY(bill_id)
    );
    if (response.status === 200) {
      Swal.fire({
        title: "Thành công",
        text: "Hóa đơn đã được thanh toán thành công",
        icon: "success",
      });
      setReloadCount((prev) => prev + 1);
    }
  };

  const cancelHoadon = async (bill_id: string) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.PAYMENT.BILL.CANCEL(bill_id)
    );
    if (response.status === 200) {
      Swal.fire({
        title: "Thành công",
        text: "Hóa đơn đã được hủy thành công",
        icon: "success",
      });
      setReloadCount((prev) => prev + 1);
    }
  };

  const unpayHoadon = async (bill_id: string) => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.PAYMENT.BILL.UNPAY(bill_id)
    );
    if (response.status === 200) {
      Swal.fire({
        title: "Thành công",
        text: "Hóa đơn đã được đánh dấu chưa thanh toán thành công",
        icon: "success",
      });
      setReloadCount((prev) => prev + 1);
    }
  };

  const renderBillActions = (bill: Bill) => {
    const { bill_id, status } = bill;
  
    return (
      <ButtonGroup size="sm" className="d-flex flex-wrap gap-2">
        <Button
          id={`btn-delete-${bill_id}`}
          color="danger"
          onClick={() => {
            Swal.fire({
              title: 'Bạn có chắc muốn xóa hóa đơn này?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Có, xóa',
              cancelButtonText: 'Hủy',
            }).then((result) => {
              if (result.isConfirmed) deleteHoadon(bill_id);
            });
          }}
        >
          <i className="fas fa-trash-alt"></i>
        </Button>
        <UncontrolledTooltip target={`btn-delete-${bill_id}`}>
          Xóa hóa đơn
        </UncontrolledTooltip>
  
        {status === "1" && (
          <>
            <Button
              id={`btn-pay-${bill_id}`}
              color="success"
              onClick={() => payHoadon(bill_id)}
            >
              <i className="fas fa-check-circle"></i>
            </Button>
            <UncontrolledTooltip target={`btn-pay-${bill_id}`}>
              Đánh dấu đã thanh toán
            </UncontrolledTooltip>
  
            <Button
              id={`btn-cancel-${bill_id}`}
              color="warning"
              onClick={() => {
                Swal.fire({
                  title: 'Bạn có chắc muốn hủy hóa đơn này?',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Có, hủy',
                  cancelButtonText: 'Hủy',
                }).then((result) => {
                  if (result.isConfirmed) cancelHoadon(bill_id);
                });
              }}
            >
              <i className="fas fa-ban"></i>
            </Button>
            <UncontrolledTooltip target={`btn-cancel-${bill_id}`}>
              Hủy hóa đơn
            </UncontrolledTooltip>
          </>
        )}
  
        {status === "2" && (
          <>
            <Button
              id={`btn-unpay-${bill_id}`}
              color="secondary"
              onClick={() => unpayHoadon(bill_id)}
            >
              <i className="fas fa-undo"></i>
            </Button>
            <UncontrolledTooltip target={`btn-unpay-${bill_id}`}>
              Đánh dấu chưa thanh toán
            </UncontrolledTooltip>
          </>
        )}
      </ButtonGroup>
    );
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
                  Danh Sách Hóa Đơn{" "}
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
                  Tạo Hóa Đơn Mới
                </Button>
              </div>
              <CardBody>
                <div className="table-responsive">
                  <table id="list_bill" className="display table">
                    <thead>
                      <tr>
                        <th className={`${styles.thLight} fw-normal`}>ID</th>
                        <th className={`${styles.thLight} fw-normal`}>
                          ID Hóa Đơn
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Số Tiền
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Ghi Chú
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Trạng Thái
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Thanh Toán Bằng
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Thời Gian Tạo
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Cập Nhật Cuối
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Chia Sẻ
                        </th>
                        <th className={`${styles.thLight} fw-normal`}>
                          Hành Động
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {billData.map((bill, index) => (
                        <tr key={bill.id}>
                          <td>{index + 1}</td>
                          <td>{bill.bill_id}</td>
                          <td>{bill.amount}</td>
                          <td>{bill.note}</td>
                          <td>{renderStatusBadge(bill.status)}</td>
                          <td>{bill.payment_method}</td>
                          <td>{formatTimeAgoCreate(bill.created_at)}</td>
                          <td>{formatTimeAgo(bill.updated_at)}</td>
                          <td>
                            {renderShareButton(bill.bill_id, bill.amount)}
                          </td>
                          <td>{renderBillActions(bill)}</td>
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
        <ModalHeader toggle={toggleModal}>Tạo Hóa Đơn Mới</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="sotien">Số Tiền:</Label>
              <Input
                id="sotien"
                name="sotien"
                type="number"
                placeholder="Vui lòng nhập số tiền..."
                style={{ fontSize: "18px" }}
              />
            </FormGroup>
            <FormGroup>
              <Label for="comment">Ghi Chú:</Label>
              <Input
                id="comment"
                name="comment"
                type="textarea"
                placeholder="Vui lòng nhập ghi chú..."
                style={{ fontSize: "18px" }}
              />
            </FormGroup>
            <FormGroup>
              <Label for="return_url">Return URL (tùy chọn):</Label>
              <Input
                id="return_url"
                name="return_url"
                type="url"
                placeholder="Nhập link return url..."
                style={{ fontSize: "18px" }}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleModal}>
            Đóng
          </Button>
          <Button
            color="solid"
            onClick={() => console.log("Gửi dữ liệu tạo hóa đơn")}
          >
            Tạo Hóa Đơn
          </Button>
        </ModalFooter>
      </Modal>
    </CommonLayout>
  );
};

export default BillPage;
