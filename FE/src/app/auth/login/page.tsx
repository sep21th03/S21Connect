"use client";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import AuthenticationMainSection from "@/components/auth/login/AuthenticationMainSection";
import LoginHeaderSection from "@/components/auth/login/LoginHeaderSection";
import LoadingLoader from "@/layout/LoadingLoader";
import { Media } from "reactstrap";

const Login = () => {
  
  return (
    <>
    <LoadingLoader/>
    <section className="login-section">
      <LoginHeaderSection />
      <AuthenticationMainSection />
      <div className="how-work">
        <Media>
          <DynamicFeatherIcon iconName="PlayCircle" />
          <Media body>
            <h2>KẾT NỐI VỚI BẠN BÈ</h2>
            <p>Tạo tài khoản và kết nối với bạn bè của bạn để bắt đầu sử dụng.</p>
          </Media>
        </Media>
      </div>
    </section>
    </>
  );
};

export default Login;
