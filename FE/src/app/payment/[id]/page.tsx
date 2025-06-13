"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { API_ENDPOINTS } from "@/utils/constant/api";
import axiosInstance from "@/utils/axiosInstance";
import Sep21Connect from "../../../../public/assets/images/icon/Sep21Connect.png";
import LoadingLoader from "@/layout/LoadingLoader";

interface PaymentData {
  bill_id: string;
  data_orderCode: string;
  data_accountName: string;
  data_accountNumber: string;
  data_description: string;
  data_qrCode: string;
  amount: number;
  comment: string;
  status: number;
  return_url?: string;
}

const PaymentPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [data, setData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQrPopup, setShowQrPopup] = useState(false);

  useEffect(() => {
    if (searchParams.has("success") && searchParams.has("message")) {
      const success = searchParams.get("success") === "true";
      const message = searchParams.get("message");

      Swal.fire({
        title: success ? "Thành công" : "Thất bại",
        text: message || "",
        icon: success ? "success" : "error",
      });

      setTimeout(() => {
        window.location.href = `/payment/${id}`;
      }, 3000);
    }

    const intervalId = setInterval(() => {
      checkBillStatus();
      fetchPaymentInfo();
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  const checkBillStatus = async () => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.PAYMENT.BILL.CHECK_BILL,
        {
          bill_id: id,
        }
      );

      const result = response.data;

      if (result.status === "success") {
        if (result.data.return_url) {
          window.location.href = result.data.return_url;
        } else {
          window.location.href = `/payment/${id}`;
        }
      }
    } catch (error) {
      console.error("Error checking bill status:", error);
    }
  };

  const fetchPaymentInfo = async () => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.PAYMENT.BILL.GET_INFO_BILL,
        {
          bill_id: id,
        }
      );
      const result = response.data;

      if (result && result.data) {
        setData(result.data);
        setLoading(false);
      } else {
        console.error("Unexpected API response:", result);
      }
    } catch (error) {
      console.error("Error fetching payment info:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const renderPaymentStatus = () => {
    if (!data) return null;

    if (data.status == 1) {
      return (
        <a className="btn btn-warning light">
          <i className="fas fa-spinner fa-spin"></i> Đang chờ thanh toán
        </a>
      );
    } else if (data.status == 2) {
      return (
        <a className="btn btn-success light">
          <i className="fas fa-check"></i> Thanh toán thành công
        </a>
      );
    } else if (data.status == 3) {
      return (
        <a className="btn btn-danger light">
          <i className="fas fa-times"></i> Đã hủy
        </a>
      );
    }

    return null;
  };

  return (
    <>
      {loading ? (
        <LoadingLoader />
      ) : (
        <div className="vh-100">
          <div className="authincation h-100">
            <div className="container-fluid h-100">
              <div className="row h-100">
                <div className="col-xl-6 col-lg-6">
                  <div className="pages-left h-100 card fade-in">
                    <div id="load_qr">
                      <div className="login-content text-center">
                        <a href="#">
                          <img
                            src={Sep21Connect.src}
                            className="mb-3"
                            alt="Logo"
                          />
                        </a>
                        <p style={{ fontSize: "20px" }}>
                          Mở App Ngân hàng bất kỳ để <b>quét mã QR</b> hoặc{" "}
                          <b>chuyển khoản</b> chính xác số tiền theo thông tin
                          bên dưới
                        </p>
                      </div>
                      <div className="login-content mb-3 text-center">
                        <p style={{ fontSize: "20px" }}>
                          Lưu ý : Nhập chính xác số tiền{" "}
                          <b>{formatCurrency(data?.amount || 0)}</b> khi chuyển
                          khoản
                        </p>
                      </div>
                      {data && data.status == 1 && (
                        <div className="text-center" id="lightgallery">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=345x345&data=${data.data_qrCode}`}
                            alt="QR Code"
                            className="img-fluid"
                            style={{
                              cursor: "pointer",
                              maxWidth: "100%",
                              height: "auto",
                            }}
                            onClick={() => setShowQrPopup(true)}
                          />
                        </div>
                      )}
                      {data && data.status == 2 && (
                        <div className="alert alert-primary notification text-center">
                          <p
                            className="notificaiton-title mb-2"
                            style={{ fontSize: "24px" }}
                          >
                            <i className="fa fa-check-circle me-2"></i> Thanh
                            toán thành công
                          </p>
                          <p style={{ fontSize: "20px" }}>
                            Hóa đơn <b>#{data?.data_orderCode || ""}</b> đã được
                            thanh toán thành công với số tiền{" "}
                            <b>{formatCurrency(data?.amount || 0)}</b>
                          </p>
                        </div>
                      )}
                      {data && data.status == 3 && (
                        <div className="alert alert-danger notification text-center">
                          <p
                            className="notificaiton-title mb-2"
                            style={{ fontSize: "24px" }}
                          >
                            <i className="fa fa-times-circle me-2"></i> Đã hủy
                          </p>
                          <p style={{ fontSize: "20px" }}>
                            Hóa đơn <b>#{data.data_orderCode}</b> đã bị hủy
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-12 col-sm-12 mx-auto align-self-center">
                  <div className="login-form">
                    <div className="card fade-in" id="load_info">
                      <div className="card-body pb-3">
                        <div className="row align-items-center">
                          <div className="col-xl-4 mb-3">
                            <p className="mb-2">ID Thanh Toán</p>
                            <h2 className="mb-0">
                              #{data?.data_orderCode || ""}
                            </h2>
                          </div>
                          <div className="col-xl-8 d-flex flex-wrap justify-content-between align-items-center">
                            <div className="d-flex me-3 mb-3 ms-2 align-items-start">
                              <i className="fa fa-phone scale-2 me-4 mt-2 text-primary"></i>
                              <div>
                                <p className="mb-2">Hỗ Trợ</p>
                                <h4 className="mb-0">+84 972842548</h4>
                              </div>
                            </div>
                            <div className="d-flex me-3 mb-3 ms-2 align-items-start">
                              <i className="fa fa-envelope text-danger scale-2 me-4 mt-2"></i>
                              <div>
                                <p className="mb-2">Email</p>
                                <h4 className="mb-0">
                                  s21connect.tech@gmail.com
                                </h4>
                              </div>
                            </div>
                            <div className="d-flex mb-3" id="payment_status">
                              {renderPaymentStatus()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card-body pb-3 transaction-details flex-wrap justify-content-between align-items-center">
                        <div className="user-bx-2 me-3 mb-3">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/2/25/Logo_MB_new.png"
                            className="rounded"
                            alt="Bank Logo"
                            width={100}
                            height={100}
                          />
                          <div>
                            <h3>Ngân hàng</h3>
                            <span>Ngân hàng TMCP Quân đội</span>
                          </div>
                        </div>
                        <div className="me-3 mb-3">
                          <p className="mb-2">Chủ tài khoản</p>
                          <h4 className="mb-0">
                            {data?.data_accountName || ""}
                          </h4>
                        </div>
                        <div className="me-3 mb-3">
                          <p className="mb-2">Số tài khoản</p>
                          <h4 className="mb-0">
                            {data?.data_accountNumber || ""}
                          </h4>
                        </div>
                        <div className="me-3 mb-3">
                          <p className="mb-2">Số tiền</p>
                          <h4 className="mb-0">
                            {formatCurrency(data?.amount || 0)}
                          </h4>
                        </div>
                        <div className="me-3 mb-3">
                          <p className="mb-2">Nội dung</p>
                          <h4 className="mb-0">
                            <code>{data?.data_description || ""}</code>
                          </h4>
                        </div>
                        <div className="me-3 mb-3">
                          <p className="mb-2">Ghi chú</p>
                          <h4 className="mb-0">{data?.comment || ""}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showQrPopup && (
        <div
          className="qr-popup-overlay"
          onClick={() => setShowQrPopup(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="qr-popup-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "90%",
              maxHeight: "90%",
              overflow: "auto",
            }}
          >
            <button
              onClick={() => setShowQrPopup(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "transparent",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${data?.data_qrCode || ""}`}
              alt="Popup QR Code"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentPage;
