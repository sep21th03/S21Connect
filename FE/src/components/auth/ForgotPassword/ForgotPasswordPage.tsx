import { Container, Row, Col } from "reactstrap";
import ForgotPasswordForm from "@/components/auth/ForgotPassword/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  return (
    <Container>
      <Row>
        <Col md="8" className="m-auto">
          <div className="login-form" style={{ width: "100%" }}>
            <div className="login-title">
              <h2>Quên mật khẩu</h2>
            </div>
            <div className="form-sec">
              <ForgotPasswordForm />
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPasswordPage;
