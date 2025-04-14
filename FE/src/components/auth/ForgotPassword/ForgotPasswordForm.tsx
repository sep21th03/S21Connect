import React, { useState } from "react";
import { FormGroup, Input, Label, Button } from "reactstrap";
import { toast } from "react-toastify";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import Link from "next/link";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      toast.success(res.data.message || "Vui lòng kiểm tra email để đặt lại mật khẩu.");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.response?.data?.error || "Đã xảy ra lỗi.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="theme-form" onSubmit={handleSubmit}>
      <FormGroup>
        <Label>Email</Label>
        <FormGroup>
          <Input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <DynamicFeatherIcon iconName="Mail" className="input-icon iw-20 ih-20" />
        </FormGroup>
      </FormGroup>
      <div className="btn-section">
        <Button type="submit" className="btn btn-solid btn-md" disabled={loading}>
          {loading ? "Đang gửi..." : "Gửi yêu cầu"}
        </Button>
        <Link
          href="/auth/login"
          className="btn btn-outline-secondary ms-auto btn-md"
        >
          Quay lại
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
