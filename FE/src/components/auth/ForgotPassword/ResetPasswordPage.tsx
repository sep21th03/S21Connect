import { Container, Row, Col } from "reactstrap";
import ResetPasswordForm from "@/components/auth/ForgotPassword/ResetPasswordForm";

const ResetPasswordPage = () => {
  return (
    <Container>
      <Row>
        <Col md="6" className="m-auto">
          <div className="login-form" style={{ width: "100%" }}>
            <div className="form-sec">
              <ResetPasswordForm />
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPasswordPage;
