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
import ReportStats from "./ReportStats";
import styles from "@/style/invoiceCard.module.css";
import {
  REASON_CODE_MAP,
  Report,
  ReportablePost,
  ReportTypeEnum,
  ReportStatusEnum,
} from "@/Data/admin";
import { STATUS_MAP } from "@/utils/formatStatus";
import { truncateText } from "@/utils/index";
import { formatDate } from "@/utils/formatTime";
import { API_ENDPOINTS } from "@/utils/constant/api";
import axiosInstance from "@/utils/axiosInstance";

const SortIcon = ({
  column,
  sortConfig,
}: {
  column: string;
  sortConfig: { key: string; direction: string };
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

const ReportTable = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [reportAction, setReportAction] = useState("");
  const [actionModalOpen, setActionModalOpen] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.REPORTS);
      setReports(response.data);
    };
    fetchReports();
  }, []);

  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    searchTerm: "",
  });

  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

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

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(
        (report) =>
          report.reason_text.toLowerCase().includes(searchLower) ||
          (report.reportable?.content &&
            report.reportable.content.toLowerCase().includes(searchLower))
      );
    }

    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredReports(result);
  }, [reports, filters, sortConfig]);

  const handleSort = (key: string) => {
    let direction = "asc";
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
    setActionModalOpen(false);

    // In a real app, you would call an API here
    const updatedReports = reports.map((report) => {
      if (report.id === selectedReport.id) {
        return {
          ...report,
          status: reportAction,
          admin_note: adminNote,
          updated_at: new Date().toISOString(),
        };
      }
      return report;
    });

    setReports(updatedReports);
    setAdminNote("");
    setReportAction("");

    // Close details modal if open
    if (isModalOpen) {
      setIsModalOpen(false);
    }
  };

  return (
    <div>
      {/* <ReportStats reports={reports} /> */}

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
                <option value={ReportStatusEnum.All}>Tất cả trạng thái</option>
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
                <option value={ReportTypeEnum.All}>Tất cả loại</option>
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
                          Ngày báo cáo{" "}
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
                          Trạng thái{" "}
                          <SortIcon column="status" sortConfig={sortConfig} />
                        </div>
                      </th>
                      <th className="text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={6} className={styles.emptyState}>
                          <AlertCircle
                            size={40}
                            className={styles.emptyStateIcon}
                          />
                          <p>Không tìm thấy báo cáo nào.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((report) => {
                        const status = STATUS_MAP[report.status] || {};
                        return (
                          <tr key={report.id}>
                            <td>#{report.id}</td>
                            <td>
                              <Badge
                                color={
                                  report.reportable_type === "Post"
                                    ? "info"
                                    : "secondary"
                                }
                                pill
                                className="text-xs"
                              >
                                {report.reportable_type === "Post"
                                  ? "Bài viết"
                                  : report.reportable_type === "Comment"
                                  ? "Bình luận"
                                  : report.reportable_type === "User"
                                  ? "Người dùng"
                                  : report.reportable_type === "Page"
                                  ? "Trang"
                                  : "Nhóm"}
                              </Badge>
                            </td>
                            <td title={report.reason_text}>
                              {REASON_CODE_MAP[report.reason_code] ||
                                truncateText(report.reason_text)}
                            </td>
                            <td>{formatDate(report.created_at)}</td>
                            <td>
                              <span
                                className={`${styles.statusBadge} ${status.className}`}
                              >
                                {status.icon &&
                                  React.createElement(status.icon, {
                                    size: 14,
                                  })}
                                {status.label || report.status}
                              </span>
                            </td>
                            <td className="text-right">
                              <Button
                                color="info"
                                size="sm"
                                className={`${styles.actionButton} ${styles.actionButtonInfo}`}
                                onClick={() => viewReportDetails(report)}
                              >
                                <Eye size={14} /> Chi tiết
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Modal xem chi tiết báo cáo */}
      <Modal
        isOpen={isModalOpen}
        toggle={() => setIsModalOpen(!isModalOpen)}
        size="lg"
      >
        <ModalHeader
          toggle={() => setIsModalOpen(!isModalOpen)}
          className={styles.modalTitle}
        >
          Chi tiết báo cáo #{selectedReport?.id}
        </ModalHeader>
        <ModalBody className={styles.modalContent}>
          {selectedReport && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Loại báo cáo</label>
                  <div className="font-medium">
                    <Badge
                      color={
                        selectedReport.reportable_type === "Post"
                          ? "info"
                          : "secondary"
                      }
                      pill
                    >
                      {selectedReport.reportable_type === "Post"
                        ? "Bài viết"
                        : "Bình luận"}
                    </Badge>
                  </div>
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Trạng thái</label>
                  <div>
                    {(() => {
                      const status = STATUS_MAP[selectedReport.status];
                      if (!status) return <span>{selectedReport.status}</span>;
                      const IconComponent = status.icon;
                      return (
                        <span
                          className={`${styles.statusBadge} ${status.className}`}
                        >
                          {IconComponent && <IconComponent size={14} />}
                          {status.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Lý do báo cáo</label>
                  <div className="font-medium">
                    {REASON_CODE_MAP[selectedReport.reason_code] ||
                      selectedReport.reason_text ||
                      "Không có lý do"}
                  </div>
                </div>

                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Ngày báo cáo</label>
                  <div className="font-medium">
                    {formatDate(selectedReport.created_at)}
                  </div>
                </div>
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Nội dung báo cáo</label>
                <Card className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {selectedReport.reportable?.content ? (
                    <p>{selectedReport.reportable.content}</p>
                  ) : (
                    <p className="text-gray-500 italic">
                      Không có nội dung chi tiết
                    </p>
                  )}
                </Card>
              </div>
              {selectedReport.reportable_type === "Post" && (
                <div className="mt-2">
                  <a
                    href={`/posts/${selectedReport.reportable?.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Xem bài viết
                  </a>
                </div>
              )}

              {selectedReport.reportable_type === "User" && (
                <div className="mt-2">
                  <a
                    href={`/profile/timeline/${selectedReport.reportable?.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Xem hồ sơ người dùng
                  </a>
                </div>
              )}

              <div className={styles.modalField}>
                <label className={styles.modalLabel}>Ghi chú của admin</label>
                <div>
                  <textarea
                    className="p-3 bg-blue-50 rounded-lg border border-blue-100 w-full"
                    value={adminNote} 
                    onChange={(e) => setAdminNote(e.target.value)} 
                    placeholder="Nhập ghi chú của admin..."
                    rows={4}
                  />
                </div>
              </div>

              {selectedReport.status === "pending" && (
                <div className="flex gap-3 mt-6 justify-end">
                  <Button
                    color="success"
                    className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
                    onClick={() =>
                      handleActionReport(selectedReport, "approved")
                    }
                  >
                    <CheckCircle size={16} /> Duyệt báo cáo
                  </Button>
                  <Button
                    color="danger"
                    className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
                    onClick={() =>
                      handleActionReport(selectedReport, "rejected")
                    }
                  >
                    <XCircle size={16} /> Từ chối
                  </Button>
                </div>
              )}
            </>
          )}
        </ModalBody>
      </Modal>

      {/* Modal xử lý báo cáo */}
      {/* <Modal
        isOpen={actionModalOpen}
        toggle={() => setActionModalOpen(!actionModalOpen)}
      >
        <ModalHeader
          toggle={() => setActionModalOpen(!actionModalOpen)}
          className={styles.modalTitle}
        >
          {reportAction === "approved" ? "Duyệt báo cáo" : "Từ chối báo cáo"}
        </ModalHeader>
        <ModalBody className={styles.modalContent}>
          <div className={styles.modalField}>
            <label className={styles.modalLabel}>Ghi chú của admin</label>
            <Input
              type="textarea"
              placeholder="Nhập ghi chú của admin..."
              rows={4}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button color="secondary" onClick={() => setActionModalOpen(false)}>
              Hủy
            </Button>
            <Button
              color={reportAction === "approved" ? "success" : "danger"}
              className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
              onClick={submitAction}
            >
              {reportAction === "approved"
                ? "Duyệt báo cáo"
                : "Từ chối báo cáo"}
            </Button>
          </div>
        </ModalBody>
      </Modal> */}
    </div>
  );
};

export default ReportTable;
