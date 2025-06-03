"use client";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import ResetPasswordPage from "@/components/auth/ForgotPassword/ResetPasswordPage";
import LoginHeaderSection from "@/components/auth/login/LoginHeaderSection";
import ThemeCustomizer from "@/layout/CommonLayout/ThemeCustomizer";
import LoadingLoader from "@/layout/LoadingLoader";
import { Media } from "reactstrap";

const ResetPage = () => {
  return (
    <>
      <LoadingLoader />
      <section className="login-section">
        <LoginHeaderSection />
        <ResetPasswordPage />
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

export default ResetPage;
