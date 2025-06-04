"use client";
import React, { useEffect, useState } from "react";
import CommonLayout from "@/layout/CommonLayout";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import { invoiceStats } from "@/Data/Spay";
import { Domain } from "@/utils/constant/index";
import SpaySideBar from "@/layout/CommonLayout/FullSideBar/SpaySideBar";
import styles from "@/style/invoiceCard.module.css";
import { API_ENDPOINTS } from "@/utils/constant/api";
import axiosInstance from "@/utils/axiosInstance";
import {
  formatTimeAgo,
  formatTimeAgoCreate,
} from "@/utils/formatTime";

interface Info {
  vnd: number;
  count_bill: number;
  count_bill_cancel: number;
  count_bill_pay: number;
  count_bill_unpay: number;
  username: string;
}

const PaymentDashboard = () => {
  const [reload_history, setReload_history] = useState(false);
  const [history, setHistory] = useState([]);
  const [info, setInfo] = useState<Info>({} as Info);
  const reload_Click = (id: string, list_id: string) => {
    setReload_history(!reload_history);
  };
  useEffect(() => {
    const fetchHistory = async () => {
      const [infoRes, historyRes] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.PAYMENT.BILL.GET_INFO),
        axiosInstance.get(API_ENDPOINTS.PAYMENT.BILL.GET_HISTORY),
      ]);
      setHistory(historyRes.data.data);
      setInfo(infoRes.data.data);
    };
    fetchHistory();
  }, [reload_history]);

  return (
    <CommonLayout mainClass="spay-page custom-padding" loaderName="payment">
      <SpaySideBar />
      <Container fluid className="section-t-space">
        <Row className="invoice-card-row">
          {invoiceStats.map((stat) => {
            const dynamicValue = info[stat.id as keyof Info] ?? 0;
            return (
            <Col key={stat.id} xl="3" xxl="3" sm="6">
              <Card
                className={`bg-${stat.bg} ${styles.styleCard} ${styles.invoiceCard}`}
              >
                <CardBody className={`${styles.invoiceCardBody} d-flex`}>
                  <div className="icon me-3">{stat.icon}</div>
                  <div>
                    <h2 className="text-white invoice-num" id={stat.id}>
                      {dynamicValue}
                    </h2>
                    <span className="text-white fs-18">{stat.title}</span>
                  </div>
                </CardBody>
              </Card>
              </Col>
            );
          })}
        </Row>
        <Row className="mt-4">
          <Col xl="12" xxl="12">
            <Card className={`${styles.styleCard}`}>
              <CardBody className={`${styles.invoiceCardBody} d-flex`}>
                <Row className="align-items-center">
                  <Col xl="6">
                    <div
                      className={`${styles.cardBx} position-relative text-white p-4`}
                    >
                      <img
                        className={`pattern-img position-absolute top-0 end-0 ${styles.styleImage}`}
                        src={`${Domain}/assets/images/spay/pattern6.png`}
                        alt=""
                      />
                      <div
                        className="card-info text-white"
                        style={{ zIndex: 2 }}
                      >
                        <img
                          src={`${Domain}/assets/images/spay/circle.png`}
                          className="mb-4"
                          alt=""
                        />
                        <h2
                          className={`text-white card-balance ${styles.styleBalance}`}
                          id="user_vnd"
                        >
                          {info.vnd ? info.vnd + " VNĐ" : 0}
                        </h2>
                        <p className="fs-16">Số dư tài khoản</p>
                      </div>
                      <a
                        className={`change-btn active d-inline-flex align-items-center gap-1 ${styles.styleChangeBtn}`}
                        href="javascript:void(0);"
                      >
                        <i className="fa fa-caret-up up-ico"></i>
                        Change
                        <span className="reload-icon">
                          <i className="fas fa-sync-alt reload active ms-1"></i>
                        </span>
                      </a>
                    </div>
                  </Col>

                  <Col xl="6">
                    <Row className="align-items-center mt-xl-0 mt-4">
                      <Col md="6">
                        <h4 className="card-title">Dòng tiền</h4>
                        <span>
                          Thống kê các dòng tiền từ shop đổ vào tài khoản của
                          bạn
                        </span>
                        <ul className="card-list mt-4" id="card-list-shop">
                        </ul>
                      </Col>
                      <Col md="6" style={{ height: "200px" }}>
                        <canvas
                          id="polarChart_main"
                          className={`${styles.styleCanvas}`}
                        ></canvas>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col xl="12" xxl="12">
            <Card className={`${styles.styleCard}`}>
              <div
                className={`${styles.CardHeader} d-flex justify-content-between align-items-center`}
              >
                <h4 className={`${styles.cardTitle} mb-0`}>
                  Lịch Sử Hoạt Động{" "}
                  <a
                    className="change-btn active"
                    href="#"
                    onClick={() => reload_Click("reload_history", "list_history")}
                    title="Tải lại dữ liệu"
                  >
                    <span className="reload-icon">
                      <i className="fas fa-sync-alt reload_history active"></i>
                    </span>
                  </a>
                </h4>
              </div>
              <CardBody>
                <div className="table-responsive">
                  <table id="list_history" className="display table">
                    <thead>
                      <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Nội Dung</th>
                        <th scope="col">Người Dùng</th>
                        <th scope="col">Thời Gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item: any) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.message}</td>
                          <td>{item.username}</td>
                          <td>{formatTimeAgo(item.updated_at)}</td>
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
    </CommonLayout>
  );
};

export default PaymentDashboard;
