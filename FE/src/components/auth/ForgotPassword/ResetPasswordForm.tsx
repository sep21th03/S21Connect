"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { useRouter, useSearchParams } from "next/navigation";
import { FormGroup, Input, Label, Button } from "reactstrap";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { toast } from "react-toastify";
import PasswordStrengthMeter, {
  validatePassword,
} from "@/utils/PasswordStrengthMeter";

const ResetPasswordForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirmation: "",
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (tokenParam) {
      setToken(tokenParam);
    }

    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setErrorMessage("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        {
          token,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        }
      );

      if (response.data) {
        toast.success(response.data.message || "Đặt lại mật khẩu thành công.");
        setTimeout(() => {
          router.push("/authentication/login");
        }, 2000);
      }
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.error || "Đã xảy ra lỗi khi đặt lại mật khẩu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Đặt lại mật khẩu</h2>
      <form className="theme-form" onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </FormGroup>
        <FormGroup className="position-relative">
          <Label htmlFor="password">Mật khẩu mới</Label>
          <div className="position-relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <div
              className="position-absolute"
              style={{
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <DynamicFeatherIcon
                iconName={showPassword ? "EyeOff" : "Eye"}
                className="cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
          </div>
        </FormGroup>
        <PasswordStrengthMeter password={formData.password} />
        <FormGroup>
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
          <div className="position-relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
            />
            <div
              className="position-absolute"
              style={{
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <DynamicFeatherIcon
                iconName={showConfirmPassword ? "EyeOff" : "Eye"}
                className="cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>
          </div>
        </FormGroup>
        <Button
          type="submit"
          className="btn btn-solid btn-lg"
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
        </Button>
        {errorMessage && (
          <div className="error-message mt-2 text-danger">{errorMessage}</div>
        )}
      </form>
    </div>
  );
};

export default ResetPasswordForm;
