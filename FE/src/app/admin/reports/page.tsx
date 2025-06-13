"use client";
import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  ChevronUp,
  Search as SearchIcon,
  AlertCircle,
  ChevronDown,
} from "react-feather";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import styles from "@/style/invoiceCard.module.css";
import {
  REASON_CODE_MAP,
  Report,
  ReportTypeEnum,
  ReportStatusEnum,
} from "@/Data/admin";
import { STATUS_MAP } from "@/utils/formatStatus";
import { truncateText } from "@/utils/index";
import { formatDate } from "@/utils/formatTime";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { adminService } from "@/service/adminService";

type ReportableType = keyof typeof REASON_CODE_MAP;
type ReasonCodeMap = typeof REASON_CODE_MAP;

const getReasonText = (
  reportable_type: ReportableType,
  reason_code: keyof ReasonCodeMap[ReportableType]
) => REASON_CODE_MAP[reportable_type][reason_code];
type SortConfig = {
  key: keyof Report;
  direction: "asc" | "desc";
};

const SortIcon = ({
  column,
  sortConfig,
}: {
  column: keyof Report;
  sortConfig: SortConfig;
}) => {
  if (sortConfig.key !== column) {
    return (
      <ChevronDown size={16} className={`${styles.sortIcon} opacity-50`} />
    );
  }
  return sortConfig.direction === "asc" ? (
    <ChevronUp size={16} className={styles.sortIcon} />
  ) : (
    <ChevronDown size={16} className={styles.sortIcon} />
  );
};

function getReasonLabel(type: keyof ReasonCodeMap, code: string): string {
  return (
    REASON_CODE_MAP[type]?.[
      code as keyof (typeof REASON_CODE_MAP)[typeof type]
    ] ?? code
  );
}

const ReportTable: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [reportAction, setReportAction] = useState("");
  const [actionModalOpen, setActionModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    searchTerm: "",
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "created_at",
    direction: "desc",
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await adminService.fetchReports();
        setReports(response);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    let result = [...reports];

    if (filters.status !== "all") {
      result = result.filter((report) => report.status === filters.status);
    }

    if (filters.type !== "all") {
      result = result.filter(
        (report) => report.reportable_type === filters.type
      );
    }

    if (filters.searchTerm.trim() !== "") {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter((report) => {
        const reasonText = report.reason_text?.toLowerCase() || "";
        const content = report.reportable?.content?.toLowerCase() || "";
        return (
          reasonText.includes(searchLower) || content.includes(searchLower)
        );
      });
    }

    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      const aStr = typeof aValue === "string" ? aValue : String(aValue);
      const bStr = typeof bValue === "string" ? bValue : String(bValue);

      if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredReports(result);
  }, [reports, filters, sortConfig]);

  const handleSort = (key: keyof Report) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const viewReportDetails = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleActionReport = (report: Report, action: string) => {
    setSelectedReport(report);
    setReportAction(action);
    setActionModalOpen(true);
  };

  const submitAction = () => {
    if (!selectedReport) return;
    setActionModalOpen(false);

    const updatedReports = reports.map((report) => {
      if (report.id === selectedReport.id) {
        return {
          ...report,
          status: reportAction as ReportStatusEnum,
          admin_note: adminNote,
          updated_at: new Date().toISOString(),
        };
      }
      return report;
    });

    setAdminNote("");
    setReportAction("");
    setIsModalOpen(false);
  };

  return (
    <div>
      <Card className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.dashboardTitle}>Danh sách báo cáo</h3>

          <div className={styles.filterGroup}>
            <div className={styles.searchInput}>
              <SearchIcon className={styles.inputIcon} size={18} />
              <Input
                type="text"
                placeholder="Tìm kiếm báo cáo..."
                className={styles.inputControl}
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters({ ...filters, searchTerm: e.target.value })
                }
              />
            </div>

            <div className={styles.filterSelect}>
              <Filter size={16} />
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="all">Tất cả trạng thái</option>
                <option value={ReportStatusEnum.Pending}>Chờ xử lý</option>
                <option value={ReportStatusEnum.Reviewed}>Đã duyệt</option>
                <option value={ReportStatusEnum.Rejected}>Từ chối</option>
                <option value={ReportStatusEnum.Responded}>Đã phản hồi</option>
              </select>
            </div>

            <div className={styles.filterSelect}>
              <Filter size={16} />
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
              >
                <option value="all">Tất cả loại</option>
                <option value={ReportTypeEnum.Post}>Bài viết</option>
                <option value={ReportTypeEnum.Comment}>Bình luận</option>
                <option value={ReportTypeEnum.User}>Người dùng</option>
                <option value={ReportTypeEnum.Page}>Trang</option>
                <option value={ReportTypeEnum.Group}>Nhóm</option>
              </select>
            </div>
          </div>
        </div>
        <CardBody>
          {loading ? (
            <div className={styles.emptyState}>
              <div className={styles.loadingSpinner}></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className={styles.tableCustom}>
                  <thead>
                    <tr>
                      <th
                        onClick={() => handleSort("id")}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center">
                          ID <SortIcon column="id" sortConfig={sortConfig} />
                        </div>
                      </th>
                      <th>Loại</th>
                      <th>Lý do báo cáo</th>
                      <th
                        onClick={() => handleSort("created_at")}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center">
                          Ngày báo cáo
                          <SortIcon
                            column="created_at"
                            sortConfig={sortConfig}
                          />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort("status")}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center">
                          Trạng thái
                          <SortIcon column="status" sortConfig={sortConfig} />
                        </div>
                      </th>
                      <th className="text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.id}</td>
                        <td>
                          {getReasonLabel(
                            report.reportable_type,
                            report.reason_code
                          )}
                        </td>

                        <td>{truncateText(report.reason_text || "", 30)}</td>
                        <td>{formatDate(report.created_at)}</td>
                        <td>
                          {report.status in STATUS_MAP ? (
                            <Badge
                              color={
                                STATUS_MAP[
                                  report.status as keyof typeof STATUS_MAP
                                ].color
                              }
                            >
                              {
                                STATUS_MAP[
                                  report.status as keyof typeof STATUS_MAP
                                ].label
                              }
                            </Badge>
                          ) : (
                            <Badge color="secondary">Không xác định</Badge>
                          )}
                        </td>
                        <td className="text-right">
                          <Button
                            size="sm"
                            color="info"
                            onClick={() => viewReportDetails(report)}
                          >
                            <Eye size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredReports.length === 0 && (
                  <div className={styles.emptyState}>
                    <AlertCircle size={40} className="text-warning mb-2" />
                    <p>Không tìm thấy báo cáo nào.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardBody>
      </Card>
      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(!isModalOpen)}>
        <ModalHeader toggle={() => setIsModalOpen(!isModalOpen)}>
          Chi tiết báo cáo
        </ModalHeader>
        <ModalBody>
          {selectedReport && (
            <div>
              <p>
                <strong>ID:</strong> {selectedReport.id}
              </p>
              <p>
                <strong>Lý do:</strong> {selectedReport.reason_text}
              </p>
              <p>
                <strong>Nội dung:</strong>
                {selectedReport.reportable?.content || "Không có"}
              </p>
              <div className="d-flex gap-2 mt-3">
                <Button
                  color="success"
                  onClick={() =>
                    handleActionReport(
                      selectedReport,
                      ReportStatusEnum.Reviewed
                    )
                  }
                >
                  <CheckCircle size={16} className="me-1" />
                  Chấp nhận
                </Button>
                <Button
                  color="danger"
                  onClick={() =>
                    handleActionReport(
                      selectedReport,
                      ReportStatusEnum.Rejected
                    )
                  }
                >
                  <XCircle size={16} className="me-1" />
                  Từ chối
                </Button>
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>
      <Modal isOpen={actionModalOpen} toggle={() => setActionModalOpen(false)}>
        <ModalHeader toggle={() => setActionModalOpen(false)}>
          Thêm ghi chú cho hành động
        </ModalHeader>
        <ModalBody>
          <Input
            type="textarea"
            placeholder="Nhập ghi chú của admin..."
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />
          <div className="text-end mt-3">
            <Button color="primary" onClick={submitAction}>
              Xác nhận
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ReportTable;
