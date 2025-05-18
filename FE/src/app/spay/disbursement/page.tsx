"use client";
import React, { useState } from "react";
import CommonLayout from "@/layout/CommonLayout";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import SpaySideBar from "@/layout/CommonLayout/FullSideBar/SpaySideBar";
import styles from "@/style/invoiceCard.module.css";

const DisbursementPage = () => {
  const [reloadBill, setReloadBill] = useState(false);

  const handleReload = () => {
    setReloadBill(!reloadBill);
    // Logic gọi lại API hoặc xử lý reload ở đây
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
                  onClick={() =>
                    console.log("Open modal tạo hóa đơn mới (chưa xử lý)")
                  }
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

                    <tbody>{/* Mapping dữ liệu hóa đơn tại đây */}</tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </CommonLayout>
  );
};

export default DisbursementPage;
