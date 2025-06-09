import React from "react";

interface PasswordStrengthMeterProps {
  password: string;
}

const calculatePasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[\W_]/.test(password)) score += 1;
  return score; // max 5
};

const strengthLabel = (score: number) => {
  switch (score) {
    case 0:
    case 1:
      return { label: "Rất yếu", color: "red" };
    case 2:
      return { label: "Yếu", color: "orange" };
    case 3:
      return { label: "Trung bình", color: "yellow" };
    case 4:
      return { label: "Mạnh", color: "lightgreen" };
    case 5:
      return { label: "Rất mạnh", color: "green" };
    default:
      return { label: "", color: "transparent" };
  }
};

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const score = calculatePasswordStrength(password);
  const { label, color } = strengthLabel(score);

  return (
    <div>
      <div style={{
        height: '8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden',
        marginTop: '4px',
      }}>
        <div style={{
          width: `${(score / 5) * 100}%`,
          height: '100%',
          backgroundColor: color,
          transition: 'width 0.3s ease',
        }} />
      </div>
      <div style={{ marginTop: 4, color }}>{label}</div>
    </div>
  );
};

export default PasswordStrengthMeter;


export const validatePassword = (password: string): string | null => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  if (!password) return "Vui lòng nhập mật khẩu.";
  if (password.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
  if (!regex.test(password))
    return "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.";
  return null; 
};

export const validatePhoneNumber = (phone: string): string | null => {
  const regex = /^(0|\+84)[0-9]{9,10}$/;

  if (!phone) return "Vui lòng nhập số điện thoại.";
  if (!regex.test(phone)) return "Số điện thoại không hợp lệ.";
  return null;
};

export const validateEmail = (email: string): string | null => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) return "Vui lòng nhập email.";
  if (!regex.test(email)) return "Email không hợp lệ.";
  return null;
};
