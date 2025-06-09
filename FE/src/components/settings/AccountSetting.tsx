import { AccountSettings, SaveChanges } from "../../utils/constant";
import { FormEvent, useState } from "react";
import { Col, Input, Label, Row } from "reactstrap";
import { Href } from "../../utils/constant/index";
import { toast } from "react-toastify";
import { settingService } from "@/service/settingService";
import PasswordStrengthMeter from "@/utils/PasswordStrengthMeter";

const AccountSetting: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    setIsLoading(true);
    try {
      const response = await settingService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      toast.success(response.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ các trường.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu hiện tại.");
      return;
    }
    handleChangePassword();
  };

  return (
    <div className="setting-wrapper">
      <div className="setting-title">
        <h3>{AccountSettings}</h3>
      </div>
      <div className="form-sec">
        <div>
          <form className="theme-form form-sm" onSubmit={handleSubmit}>
            <Row>
              <Col xs="12" className="form-group">
                <Label>Mật khẩu hiện tại</Label>
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  autoComplete=""
                  placeholder="******"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                {/* <span className="eye-icon" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? <i className="fa fa-eye"></i> : <i className="fa fa-eye-slash"></i>}
                </span> */}
              </Col>
              <Col sm="6" className="form-group">
                <Label>Mật khẩu mới</Label>
                <Input
                  type={showNewPassword ? "text" : "password"}
                  autoComplete=""
                  placeholder="******"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {/* <span className="eye-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <i className="fa fa-eye"></i> : <i className="fa fa-eye-slash"></i>}
                </span> */}
                {newPassword && (
                  <PasswordStrengthMeter password={newPassword} />
                )}
              </Col>
              <Col sm="6" className="form-group">
                <Label>Nhập lại mật khẩu</Label>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete=""
                  placeholder="******"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {/* <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <i className="fa fa-eye"></i> : <i className="fa fa-eye-slash"></i>}
                </span> */}
              </Col>
              <Col xs="12" className="form-group">
                <label>sử dụng hai yếu tố xác thực</label>
              </Col>
              <Col xs="12" className="form-group toggle-sec">
                <div className="button toggle-btn">
                  <input type="checkbox" defaultChecked className="checkbox" />
                  <div className="knobs">
                    <span />
                  </div>
                  <div className="layer" />
                </div>
                <label>
                  bật/tắt
                  <span>
                    chúng tôi sẽ yêu cầu mã nếu chúng tôi nhận thấy thiết bị
                    không xác thực
                  </span>
                </label>
              </Col>
            </Row>
            <div className="text-right">
              <button type="submit" className="btn btn-solid">
                {SaveChanges}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSetting;
