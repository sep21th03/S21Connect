import styles from "@/style/invoiceCard.module.css";
import { CheckCircle, XCircle, Clock } from "react-feather";

export const renderStatusBadge = (status: string | number) => {
  switch (status) {
    case "1":
    case 1:
      return <span className={`${styles.styleBadgeWarning}`}>Chưa thanh toán</span>;
    case "2":
    case 2:
      return <span className={`${styles.styleBadgeSuccess}`}>Đã thanh toán</span>;
    case "3":
    case 3:
      return <span className={`${styles.styleBadgeDanger}`}>Đã hủy</span>;
    default:
      return <span className={`${styles.styleBadgeInfo}`}>Không xác định</span>;
  }
};

export const STATUS_MAP = {
  pending: { color: "warning", icon: Clock, label: "Chờ xử lý", className: styles.statusBadgePending },
  reviewed: { color: "success", icon: CheckCircle, label: "Đã duyệt", className: styles.statusBadgeApproved },
  rejected: { color: "danger", icon: XCircle, label: "Từ chối", className: styles.statusBadgeRejected },
  responded: { color: "info", icon: CheckCircle, label: "Đã phản hồi", className: styles.statusBadgeResponded },
};