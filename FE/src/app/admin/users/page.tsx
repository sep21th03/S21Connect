"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Card,
  Table,
  CardBody,
  Badge,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
} from "reactstrap";
import { formatDate } from "@/utils/formatTime";
import styles from "@/style/invoiceCard.module.css";
import {
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  Search as SearchIcon,
  Edit,
  Trash2,
} from "react-feather";
import { adminService } from "@/service/adminService";

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

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  gender: string | null;
  birthday: string;
  email: string;
  email_verified_at: string | null;
  last_active: string | null;
  avatar: string;
  is_admin: number;
  status: string;
  created_at: string;
}

const UserTable: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({
    searchTerm: "",
    is_admin: "all",
    status: "all",
    min_reports: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  const [warnModalOpen, setWarnModalOpen] = useState(false);
  const [warnMessage, setWarnMessage] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.fetchUsers({
        page: currentPage,
        search: filters.searchTerm,
        is_admin: filters.is_admin,
        status: filters.status,
        min_reports: filters.min_reports,
      });

      if (response === null) {
        setUsers([]);
        setTotalPages(1);
      } else {
        setUsers(response.data || []);
        setTotalPages(response.last_page || 1);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filters, currentPage, sortConfig]);

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setNewStatus(user.status);
    setEditModalOpen(true);
  };

  const saveStatus = async () => {
    if (!selectedUser) return;
    try {
      await adminService.updateUserStatus(selectedUser.id, newStatus);
      loadUsers();
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const openWarnModal = (user: User) => {
    setSelectedUser(user);
    setWarnMessage("");
    setWarnModalOpen(true);
  };

  const sendWarning = async () => {
    if (!selectedUser) return;
    try {
      await adminService.sendWarning(selectedUser.id, warnMessage);
      setWarnModalOpen(false);
    } catch (error) {
      console.error("Error sending warning:", error);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (confirm(`Bạn có chắc muốn xóa user ${user.username}?`)) {
      try {
        await adminService.deleteUser(user.id);
        loadUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleSort = (key: keyof User) => {
    if (sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({
        key,
        direction: "asc",
      });
    }
  };

  return (
    <div>
      <Card className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.dashboardTitle}>Danh sách tài khoản</h3>

          <div className={styles.filterGroup}>
            <div className={styles.searchInput}>
              <SearchIcon className={styles.inputIcon} size={18} />
              <Input
                type="text"
                placeholder="Tìm kiếm tài khoản..."
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
                <option value="active">Hoạt động</option>
                <option value="banned">Bị khóa</option>
              </select>
            </div>

            <div className={styles.filterSelect}>
              <select
                value={filters.is_admin}
                onChange={(e) =>
                  setFilters({ ...filters, is_admin: e.target.value })
                }
              >
                <option value="all">Tất cả</option>
                <option value="0">Người dùng</option>
                <option value="1">Admin</option>
              </select>
            </div>

            <div className={styles.filterInput}>
              <Input
                type="number"
                min={0}
                value={filters.min_reports}
                onChange={(e) =>
                  setFilters({ ...filters, min_reports: e.target.value })
                }
                placeholder="Số lần cảnh cáo"
              />
            </div>
          </div>
        </div>
        <CardBody>
          {loading ? (
            <div className={styles.emptyState}>
              <Spinner />
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
                      <th>Tên tài khoản</th>
                      <th>Họ tên</th>
                      <th
                        onClick={() => handleSort("created_at")}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center">
                          Ngày tạo{" "}
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
                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-4 text-gray-500"
                        >
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id.slice(0, 8)}...</td>
                        <td>
                          <a
                            href={`/profile/timeline/${user.username}`}
                            className="text-primary"
                          >
                            {user.username}
                          </a>
                        </td>
                        <td>
                          <a
                            href={`/profile/timeline/${user.username}`}
                            className="text-primary"
                          >
                            {`${user.first_name} ${user.last_name}`}
                          </a>
                        </td>
                        <td>{formatDate(user.created_at)}</td>
                        <td>
                          <Badge
                            color={
                              user.status === "active"
                                ? "success"
                                : user.status === "banned"
                                ? "danger"
                                : "light"
                            }
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="text-right">
                          <Button
                            color="link"
                            title="Sửa trạng thái"
                            onClick={() => openEditModal(user)}
                            className="p-1 me-2"
                          >
                            <Edit size={18} />
                          </Button>
                          <Button
                            color="link"
                            title="Cảnh cáo"
                            onClick={() => openWarnModal(user)}
                            className="p-1 me-2"
                          >
                            <AlertCircle size={18} />
                          </Button>
                          <Button
                            color="link"
                            title="Xóa"
                            onClick={() => handleDeleteUser(user)}
                            className="p-1"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="mx-1"
                  >
                    Trước
                  </Button>
                  <span className="mx-2 self-center">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="mx-1"
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={editModalOpen}
        toggle={() => setEditModalOpen(!editModalOpen)}
      >
        <ModalHeader toggle={() => setEditModalOpen(!editModalOpen)}>
          Chỉnh sửa trạng thái tài khoản
        </ModalHeader>
        <ModalBody>
          <p>
            User:{" "}
            <strong>
              {selectedUser?.first_name} {selectedUser?.last_name} (
              {selectedUser?.username})
            </strong>
          </p>
          <FormGroup>
            <Label for="statusSelect">Trạng thái</Label>
            <Input
              type="select"
              id="statusSelect"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="active">Hoạt động</option>
              <option value="banned">Bị khóa</option>
            </Input>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button className="btn-solid btn" onClick={saveStatus} disabled={!newStatus.trim()}>
            Lưu
          </Button>{" "}
          <Button color="secondary" onClick={() => setEditModalOpen(false)}>
            Hủy
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={warnModalOpen}
        toggle={() => setWarnModalOpen(!warnModalOpen)}
      >
        <ModalHeader toggle={() => setWarnModalOpen(!warnModalOpen)}>
          Gửi cảnh cáo
        </ModalHeader>
        <ModalBody>
          <p>
            Gửi cảnh cáo cho user:{" "}
            <strong>
              {selectedUser?.first_name} {selectedUser?.last_name} (
              {selectedUser?.username})
            </strong>
          </p>
          <FormGroup>
            <Label for="warnMessage">Nội dung cảnh cáo</Label>
            <Input
              type="textarea"
              id="warnMessage"
              value={warnMessage}
              onChange={(e) => setWarnMessage(e.target.value)}
              placeholder="Nhập nội dung cảnh cáo..."
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            color="warning"
            onClick={sendWarning}
            disabled={!warnMessage.trim()}
          >
            Gửi cảnh cáo
          </Button>{" "}
          <Button color="secondary" onClick={() => setWarnModalOpen(false)}>
            Hủy
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default UserTable;