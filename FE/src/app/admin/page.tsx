"use client";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardBody, CardTitle, Container } from "reactstrap";
import styles from "@/style/invoiceCard.module.css";
import { adminService } from "@/service/adminService";

if (typeof window !== "undefined") {
  const mediaStyles = document.createElement("style");
  mediaStyles.innerHTML = `
    @media (min-width: 992px) {
      .chart-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 576px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(mediaStyles);
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPayments: 0,
    pendingReports: 0,
  });
  const [percent, setPercent] = useState({
    activeUsers: 0,
    totalUsers: 0,
    totalPayments: 0,
    pendingReports: 0,
  });
  const [activeUsersByDate, setActiveUsersByDate] = useState([]);
  const [userDistribution, setUserDistribution] = useState([]);
  const [supportData, setSupportData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);



  const pieData = [
    { name: "Người dùng hoạt động", value: stats.activeUsers },
    {
      name: "Người dùng không hoạt động",
      value: stats.totalUsers - stats.activeUsers,
    },
  ];



  const COLORS = ["#6366F1", "#10B981"];
  const REPORT_COLORS = ["#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];



  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active: boolean;
    payload: any[];
    label: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltipBox}>
          <p className={styles.tooltipTitle}>{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className={styles.tooltipItem}
              style={{ color: entry.color }}
            >
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [
          statsData,
          activeUsersData,
          userDistData,
          supportRequestsData,
          reportsData
        ] = await Promise.all([
          adminService.getDashboardData(),
          adminService.getActiveUsersByDate(),
          adminService.getUserDistribution(),
          adminService.getSupportRequests(),
          adminService.getReportsByCategory()
        ]);
        console.log(statsData);
        if (statsData) {
          setStats({
            totalUsers: statsData?.stats?.totalUsers,
            activeUsers: statsData?.stats?.activeUsers,
            totalPayments: statsData?.stats?.totalPayments || 0,
            pendingReports: statsData?.stats?.pendingReports || 0,
          });
          setPercent({
            activeUsers: statsData?.stats?.activeUsersChange,
            totalUsers: statsData?.stats?.newUsersChange,
            totalPayments: statsData?.stats?.totalPaymentsPercent || 0,
            pendingReports: statsData?.stats?.pendingReportsChange,
          });
        }

        setActiveUsersByDate(activeUsersData || []);
        setUserDistribution(userDistData || []);
        setSupportData(supportRequestsData || []);
        setReportData(reportsData || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);


  if (loading) {
    return (
      <Container fluid className={styles.dashboardContainer}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className={styles.dashboardContainer}>
      <h2 className={styles.dashboardTitle}>Tổng quan hệ thống</h2>

      <div className={`stats-grid ${styles.statsGrid}`}>
        <Card
          className={`${styles.statCard} ${styles.blueGradient} ${styles.cardShadow} ${styles.invoiceCard}`}
        >
          <CardBody className={styles.noPadding}>
            <div className={styles.statCardContent}>
              <div className={styles.statInfo}>
                <p className={styles.statTitle}>Tổng số người dùng</p>
                <p className={styles.statValue}>
                  {stats?.totalUsers?.toLocaleString()}
                </p>
                <p className={styles.statTrend}>
                  {percent.totalUsers < 0 ? (
                    <>Giảm {Math.abs(percent.totalUsers)}% so với tháng trước</>
                  ) : (
                    <>Tăng {percent.totalUsers}% so với tháng trước</>
                  )}
                </p>
              </div>
              <div className={styles.iconBox}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card
          className={`${styles.statCard} ${styles.greenGradient} ${styles.cardShadow} ${styles.invoiceCard}`}
        >
          <CardBody className={styles.noPadding}>
            <div className={styles.statCardContent}>
              <div className={styles.statInfo}>
                <p className={styles.statTitle}>Người dùng hoạt động</p>
                <p className={styles.statValue}>
                  {stats?.activeUsers?.toLocaleString()}
                </p>
                <p className={styles.statTrend}>
                  {percent.activeUsers < 0 ? (
                    <>Giảm {Math.abs(percent.activeUsers)}% so với tháng trước</>
                  ) : (
                    <>Tăng {percent.activeUsers}% so với tháng trước</>
                  )}
                </p>
              </div>
              <div className={styles.iconBox}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card
          className={`${styles.statCard} ${styles.purpleGradient} ${styles.cardShadow} ${styles.invoiceCard}`}
        >
          <CardBody className={styles.noPadding}>
            <div className={styles.statCardContent}>
              <div className={styles.statInfo}>
                <p className={styles.statTitle}>Hỗ trợ yêu cầu</p>
                <p className={styles.statValue}>
                  {stats?.totalPayments?.toLocaleString()}
                </p>
                <p className={styles.statTrend}>
                  {percent.totalPayments < 0 ? (
                    <>Giảm {Math.abs(percent.totalPayments)}% so với tháng trước</>
                  ) : (
                    <>Tăng {percent.totalPayments}% so với tháng trước</>
                  )}
                </p>
              </div>
              <div className={styles.iconBox}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card
          className={`${styles.statCard} ${styles.redGradient} ${styles.cardShadow} ${styles.invoiceCard}`}
        >
          <CardBody className={styles.noPadding}>
            <div className={styles.statCardContent}>
              <div className={styles.statInfo}>
                <p className={styles.statTitle}>Báo cáo vi phạm</p>
                <p className={styles.statValue}>
                  {stats?.pendingReports?.toLocaleString()}
                </p>
                <p className={styles.statTrend}>
                  {percent.pendingReports < 0 ? (
                    <>Giảm {Math.abs(percent.pendingReports)}% so với tháng trước</>
                  ) : (
                    <>Tăng {percent.pendingReports}% so với tháng trước</>
                  )}
                </p>
              </div>
              <div className={styles.iconBox}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className={`${styles.chartGrid} chart-grid`}>
        <Card className={styles.chartContainer}>
          <CardBody className={styles.noPadding}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Người dùng hoạt động</h3>
              <div className={styles.legendContainer}>
                <div className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{ background: "#6366F1" }}
                  ></span>
                  <span className={styles.legendText}>Tháng này</span>
                </div>
                <div className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{ background: "#10B981" }}
                  ></span>
                  <span className={styles.legendText}>Tháng trước</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activeUsersByDate}>
                <defs>
                  <linearGradient
                    id="colorThisMonth"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="colorLastMonth"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  content={
                    <CustomTooltip active={true} payload={[]} label={""} />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="thisMonth"
                  stroke="#6366F1"
                  fillOpacity={1}
                  fill="url(#colorThisMonth)"
                  name="Tháng này"
                />
                <Area
                  type="monotone"
                  dataKey="lastMonth"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorLastMonth)"
                  name="Tháng trước"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className={styles.chartContainer}>
          <CardBody className={styles.noPadding}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Phân phối người dùng</h3>
              <div className={styles.legendContainer}>
                <div className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{ background: "#6366F1" }}
                  ></span>
                  <span className={styles.legendText}>Hoạt động</span>
                </div>
                <div className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{ background: "#10B981" }}
                  ></span>
                  <span className={styles.legendText}>Không hoạt động</span>
                </div>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                    }) => {
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 1.2;
                      const x =
                        cx + radius * Math.cos((-midAngle * Math.PI) / 180);
                      const y =
                        cy + radius * Math.sin((-midAngle * Math.PI) / 180);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#555"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          fontSize="12"
                          fontWeight="500"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                  >
                    {pieData.map((entry, index) => (
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
      </div>

      <div className={`${styles.chartGrid} chart-grid`}>
        <Card className={styles.chartContainer}>
          <CardBody className={styles.noPadding}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Yêu cầu hỗ trợ theo ngày</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supportData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  content={
                    <CustomTooltip active={true} payload={[]} label={""} />
                  }
                />
                <Bar dataKey="value" name="Hỗ trợ yêu cầu">
                  {supportData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 4 ? "#6366F1" : "#A5B4FC"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className={styles.chartContainer}>
          <CardBody className={styles.noPadding}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Báo cáo theo danh mục</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {reportData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={REPORT_COLORS[index % REPORT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>
    </Container>
  );
};

export default AdminDashboard;
