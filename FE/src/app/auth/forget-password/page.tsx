"use client";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import ForgotPasswordPage from "@/components/auth/ForgotPassword/ForgotPasswordPage";
import LoginHeaderSection from "@/components/auth/login/LoginHeaderSection";
import ThemeCustomizer from "@/layout/CommonLayout/ThemeCustomizer";
import LoadingLoader from "@/layout/LoadingLoader";
import { Media } from "reactstrap";

const ForgotPage = () => {
  return (
    <>
      <LoadingLoader />
      <section className="login-section">
        <LoginHeaderSection />
        <ForgotPasswordPage />
        <div className="how-work">
          <Media>
            <DynamicFeatherIcon iconName="PlayCircle" />
            <Media body>
              <h2>Kết nối với bạn bè!</h2>
              <p>
                Tạo tài khoản và kết nối với bạn bè của bạn để bắt đầu sử dụng.
              </p>
            </Media>
          </Media>
        </div>
      </section>
      <ThemeCustomizer/>
    </>
  );
};

export default ForgotPage;
