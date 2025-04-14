import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import {
  FirstName,
  LastName,
  Password,
  ConfirmPassword,
} from "../../../utils/constant";
import Link from "next/link";
import React from "react";
import { Row, Col, FormGroup, Input, Label, Button } from "reactstrap";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { first } from "lodash";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.AUTH.REGISTER,
        formData
      );

      toast.success(
        response.data.message ||
          "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản."
      );
      setTimeout(() => {
        router.push("/authentication/login");
      }, 2000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Đăng ký thất bại. Vui lòng thử lại sau.";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="theme-form" onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label>First Name</Label>
            <div className="position-relative">
              <Input
                type="text"
                placeholder="Your Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label>Last Name</Label>
            <div className="position-relative">
              <Input
                type="text"
                placeholder="Your Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </FormGroup>
        </Col>
      </Row>
      <FormGroup>
        <label htmlFor="exampleInputUsername">Username</label>
        <Input
          type="text"
          placeholder="Enter username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <DynamicFeatherIcon
          iconName="User"
          className="input-icon iw-20 ih-20"
        />
      </FormGroup>
      <FormGroup>
        <label htmlFor="exampleInputEmail1">Email address</label>
        <Input
          type="email"
          placeholder="Enter email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <DynamicFeatherIcon
          iconName="Mail"
          className="input-icon iw-20 ih-20"
        />
      </FormGroup>
      <FormGroup>
        <Label>Mật khẩu</Label>
        <Input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="********"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
        />
        <DynamicFeatherIcon
          iconName={showPassword ? "EyeOff" : "Eye"}
          className="input-icon iw-20 ih-20 cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
        />
      </FormGroup>

      <FormGroup>
        <Label>Xác nhận mật khẩu</Label>
        <Input
          type={showConfirmPassword ? "text" : "password"}
          name="password_confirmation"
          placeholder="********"
          value={formData.password_confirmation}
          onChange={handleChange}
          required
          minLength={6}
        />
        <DynamicFeatherIcon
          iconName={showConfirmPassword ? "EyeOff" : "Eye"}
          className="input-icon iw-20 ih-20 cursor-pointer"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        />
      </FormGroup>
      <div className="btn-section">
        <Button
          type="submit"
          className="btn btn-solid btn-lg"
          disabled={loading}
        >
          {loading ? "Đăng ký..." : "Đăng ký"}
        </Button>
        <Link
          href="/auth/login"
          className="btn btn-outline-secondary btn-lg ms-auto"
        >
          Đăng nhập
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
