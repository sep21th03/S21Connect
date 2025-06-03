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
    gender: "",
    birthday: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const router = useRouter();

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, i) => 1900 + i
  ).reverse();

  useEffect(() => {
    if (birthDay && birthMonth && birthYear) {
      const formattedDate = `${birthYear}-${birthMonth.padStart(
        2,
        "0"
      )}-${birthDay.padStart(2, "0")}`;
      setFormData((prev) => ({ ...prev, birthday: formattedDate }));
    } else {
      setFormData((prev) => ({ ...prev, birthday: "" }));
    }
  }, [birthDay, birthMonth, birthYear]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.gender) {
      toast.error("Vui lòng chọn giới tính!");
      setLoading(false);
      return;
    }
    if (!formData.birthday || !birthDay || !birthMonth || !birthYear) {
      toast.error("Vui lòng chọn đầy đủ ngày sinh!");
      setLoading(false);
      return;
    }
    if (formData.password !== formData.password_confirmation) {
      toast.error("Mật khẩu không khớp!");
      setLoading(false);
      return;
    }
    if (
      formData.first_name === "" ||
      formData.last_name === "" ||
      formData.username === "" ||
      formData.email === "" ||
      formData.password === "" ||
      formData.password_confirmation === ""
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      setLoading(false);
      return;
    }

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
            <Label>Họ</Label>
            <div className="position-relative">
              <Input
                type="text"
                placeholder="Họ"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label>Tên</Label>
            <div className="position-relative">
              <Input
                type="text"
                placeholder="Tên"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </FormGroup>
        </Col>
      </Row>
      <FormGroup>
        <label htmlFor="exampleInputUsername">Tên tài khoản</label>
        <Input
          type="text"
          placeholder="Tên tài khoản"
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
        <label htmlFor="exampleInputEmail1">Email</label>
        <Input
          type="email"
          placeholder="Email"
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

      <FormGroup>
        <Label>Giới tính</Label>
        <div className="d-flex gap-3">
          <div className="radio radio-primary">
            <Input
              type="radio"
              id="male"
              name="gender"
              value="male"
              checked={formData.gender === "male"}
              onChange={handleChange}
              required
            />
            <Label for="male" className="cursor mx-3">Nam</Label>
          </div>
          <div className="radio radio-primary">
            <Input
              type="radio"
              id="female"
              name="gender"
              value="female"
              checked={formData.gender === "female"}
              onChange={handleChange}
              required
            />
            <Label for="female" className="cursor mx-3">Nữ</Label>
          </div>
          <div className="radio radio-primary">
            <Input
              type="radio"
              id="other"
              name="gender"
              value="other"
              checked={formData.gender === "other"}
              onChange={handleChange}
              required
            />
            <Label for="other" className="cursor mx-3">Khác</Label>
          </div>
        </div>
      </FormGroup>
      <FormGroup>
        <Label>Sinh nhật</Label>
        <Row>
          <Col xs={4}>
            <Input
              type="select"
              name="birthDay"
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              required
            >
              <option value="">Ngày</option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </Input>
          </Col>
          <Col xs={4}>
            <Input
              type="select"
              name="birthMonth"
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              required
            >
              <option value="">Tháng</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </Input>
          </Col>
          <Col xs={4}>
            <Input
              type="select"
              name="birthYear"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              required
            >
              <option value="">Năm</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Input>
          </Col>
        </Row>
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
