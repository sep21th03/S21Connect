"use client";
import {
  Card,
  CardBody,
} from "reactstrap";
import { CheckCircle, XCircle, Clock } from "react-feather";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import styles from "@/style/invoiceCard.module.css";

const REASON_CODE_MAP = {
  P_Nudity: "Nội dung không phù hợp",
  P_Violence: "Bạo lực",
  P_Spam: "Spam",
  C_Harassment: "Quấy rối",
  O_Other: "Khác",
};

const STATUS_MAP = {
  pending: { label: "Chờ xử lý", color: "warning", icon: Clock },
  approved: { label: "Đã duyệt", color: "success", icon: CheckCircle },
  rejected: { label: "Từ chối", color: "danger", icon: XCircle },
};

const ReportStats = ({ reports }: { reports: any[] }) => {
  const reportTypeStats: Record<string, number> = {};
  reports.forEach((report) => {
    const reasonCode = report.reason_code;
    if (!reportTypeStats[reasonCode]) {
      reportTypeStats[reasonCode] = 0;
    }
    reportTypeStats[reasonCode]++;
  });

  const statusStats = {
    pending: reports.filter((r) => r.status === "pending").length,
    approved: reports.filter((r) => r.status === "approved").length,
    rejected: reports.filter((r) => r.status === "rejected").length,
  };

  const COLORS = ["#F59E0B", "#EF4444", "#8B5CF6", "#6366F1", "#EC4899"];

  const typeData = Object.keys(reportTypeStats).map((key, index) => ({
    name: REASON_CODE_MAP[key as keyof typeof REASON_CODE_MAP] || key,
    value: reportTypeStats[key as keyof typeof reportTypeStats],
  }));

  const statusData = [
    { name: "Chờ xử lý", value: statusStats.pending },
    { name: "Đã duyệt", value: statusStats.approved },
    { name: "Từ chối", value: statusStats.rejected },
  ];

  const STATUS_COLORS = {
    "Chờ xử lý": "#F59E0B",
    "Đã duyệt": "#10B981",
    "Từ chối": "#EF4444",
  };

  return (
    <div className="flex flex-wrap gap-6 mb-6">
      <Card className={`${styles.card} bg-white rounded-xl shadow-md`}>
        <CardBody>
          <h3 className={`${styles.cardTitle} text-lg font-semibold mb-4`}>
            Thống kê theo loại báo cáo
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {typeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <Card className="w-full md:w-1/2 lg:w-1/3 bg-white rounded-xl shadow-md">
        <CardBody>
          <h3 className={`${styles.cardTitle} text-lg font-semibold mb-4`}>
            Thống kê theo trạng thái
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ReportStats;
