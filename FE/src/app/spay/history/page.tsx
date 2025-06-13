"use client";
import React, { useEffect, useState } from "react";
import CommonLayout from "@/layout/CommonLayout";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import SpaySideBar from "@/layout/CommonLayout/FullSideBar/SpaySideBar";
import styles from "@/style/invoiceCard.module.css";
import { API_ENDPOINTS } from "@/utils/constant/api";
import axiosInstance from "@/utils/axiosInstance";
import { formatTimeAgo } from "@/utils/formatTime";

interface HistoryItem {
  id: number;
  message: string;
  username: string;
  updated_at: string;
}

const HistoryPage = () => {
  const [reloadHistory, setReloadHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const reload_Click = () => {
    setReloadHistory(!reloadHistory);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const historyRes = await axiosInstance.get(API_ENDPOINTS.PAYMENT.BILL.GET_HISTORY);
        setHistory(historyRes.data.data || []);
      } catch (error) {
        console.error("Lỗi khi tải lịch sử hoạt động:", error);
      }
    };
    fetchHistory();
  }, [reloadHistory]);

  return (
    <CommonLayout mainClass="spay-page custom-padding" loaderName="payment">
      <SpaySideBar />
      <Container fluid className="section-t-space">
        <Row className="mt-4">
          <Col xl="12" xxl="12">
            <Card className={styles.styleCard}>
              <div
                className={`${styles.CardHeader} d-flex justify-content-between align-items-center`}
              >
                <h4 className={`${styles.cardTitle} mb-0`}>
                  Lịch Sử Hoạt Động{" "}
                  <a
                    className="change-btn active"
                    href="#"
                    onClick={reload_Click}
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
                      {history.length > 0 ? (
                        history.map((item) => (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.message}</td>
                            <td>{item.username}</td>
                            <td>{formatTimeAgo(item.updated_at)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center text-muted py-3">
                            Không có dữ liệu lịch sử.
                          </td>
                        </tr>
                      )}
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

export default HistoryPage;
