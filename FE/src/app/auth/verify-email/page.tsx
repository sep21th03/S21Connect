"use client";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Row, Col, Spinner } from "reactstrap";
import axiosInstance from "@/utils/axiosInstance";
import { CheckCircle, AlertCircle } from "react-feather";

const VerifyEmailPage: NextPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const hash = searchParams.get("hash");
  const expires = searchParams.get("expires");
  const signature = searchParams.get("signature");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id && hash) {
      const verifyEmail = async () => {
        try {
            const params = new URLSearchParams({
                expires: String(expires),
                signature: String(signature),
              });
          const res = await axiosInstance.get(`/auth/email/verify/${id}/${hash}?${params}`);
          setLoading(false);
          setMessage(res.data.message);
        } catch (error: any) {
          setError(
            error.response?.data?.message || "Có lỗi xảy ra khi xác minh email."
          );
          setLoading(false);
        }
      };
      verifyEmail();
    }
  }, [id, hash]);

  return (
    <section className="login-section">
      <Container fluid className="p-0">
        <Row className="m-0">
          <Col xs="12" className="p-0">
            <div className="login-card">
              <div className="login-main">
                {loading ? (
                  <div
                    className="text-center p-5 text-white"
                    style={{ fontSize: "1.5rem" }}
                  >
                    <Spinner color="primary" />
                    <p className="mt-3">Đang xác minh email của bạn...</p>
                  </div>
                ) : error ? (
                  <div className="text-center p-5">
                    <AlertCircle size={48} className="text-danger mb-4" />
                    <h2 className="mb-3">Xác minh không thành công</h2>
                    <p className="mb-4">{error}</p>
                    <div className="d-flex justify-content-center">
                      <button
                        className="btn btn-primary me-2"
                        onClick={() => router.push("/auth/verify-notice")}
                      >
                        Gửi lại email xác minh
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => router.push("/authentication/login")}
                      >
                        Đăng nhập
                      </button>
                    </div>
                  </div>
                ) : (
                  <EmailVerificationSuccess message={message} />
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default VerifyEmailPage;

type EmailVerificationSuccessProps = {
  message: string | null;
};

const EmailVerificationSuccess: React.FC<EmailVerificationSuccessProps> = ({
  message,
}) => {
  const router = useRouter();

  return (
    <div className="text-center p-5">
      <CheckCircle size={48} className="text-success mb-4" />
      <h2 className="mb-3">Xác minh thành công</h2>
      <p className="mb-4">
        {message || "Email của bạn đã được xác minh thành công!"}
      </p>
      <button
        className="btn btn-success"
        onClick={() => router.push("/authentication/login")}
      >
        Đăng nhập
      </button>
    </div>
  );
};
