"use client";

import React, { useState, useMemo } from "react";
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

interface Props {
  users?: User[];
}

const filteredUsers = [
  {
    id: "9eac242f-d01b-49e9-bd78-ff28e1429a30",
    username: "ngh10",
    first_name: "Ng",
    last_name: "aaaa",
    gender: "male",
    birthday: "2003-05-16",
    email: "nguyenhoathpt03@gmail.com",
    email_verified_at: "2025-04-14T09:44:31.000000Z",
    last_active: "2025-05-16 07:55:17",
    avatar:
      "https://res.cloudinary.com/dxzwfef7y/image/upload/v1746889129/avatars/album/esogeuqwu1ir69zvkhw9.png",
    cover_photo: null,
    bio: null,
    is_admin: 0,
    status: "active",
    created_at: "2025-04-14T09:09:46.000000Z",
    updated_at: "2025-05-16T00:55:18.000000Z",
    vnd: "0",
    secret_code: null,
  },
  {
    id: "9ec0eb53-84e1-4b0d-932f-b935cd0f1801",
    username: "hehehee",
    first_name: "hehehhe",
    last_name: "heeee",
    gender: null,
    birthday: "2003-06-20",
    email: "sep21th03luv@gmail.com",
    email_verified_at: "2025-04-24T17:08:21.000000Z",
    last_active: "2025-05-11 10:13:52",
    avatar:
      "https://scontent.fhan5-3.fna.fbcdn.net/v/t39.30808-6/477608114_548393474881278_5290903854719436454_n.jpg?stp=c256.0.1536.1536a_dst-jpg_s206x206_tt6&_nc_cat=110&ccb=1-7&_nc_sid=50ad20&_nc_ohc=MGHheFejCLoQ7kNvwGhYkKH&_nc_oc=AdmQ-PQ9-kJJr_zRPmNFMokF06HCXLJM5La8fxlyWKkc-3O4vH7ji_8Vn1Ki4P1xXWkOwTJas-1apH5xTmrnkxHR&_nc_zt=23&_nc_ht=scontent.fhan5-3.fna&_nc_gid=HNK-wr_IOL2q4b_XbBTbyg&oh=00_AfJJC6Kabs5H2nTfPAAjX_anPfs-rHu3ssYEfwiuqzz2aA&oe=682BEA94",
    cover_photo: null,
    bio: null,
    is_admin: 0,
    status: "active",
    created_at: "2025-04-24T17:03:10.000000Z",
    updated_at: "2025-05-11T10:13:55.000000Z",
    vnd: "0",
    secret_code: null,
  },
];

const UserTable: React.FC<Props> = () => {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: "",
    is_admin: "all", // "all", "0", "1"
    status: "all", // "all", "active", "inactive", "banned"
    min_reports: "", // string vì lấy từ input
  });

  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  // State modal chỉnh sửa trạng thái user
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  // State modal cảnh cáo
  const [warnModalOpen, setWarnModalOpen] = useState(false);
  const [warnMessage, setWarnMessage] = useState("");

  // Hàm mở modal sửa trạng thái
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setNewStatus(user.status);
    setEditModalOpen(true);
  };

  // Hàm lưu trạng thái mới (thường gọi API)
  const saveStatus = () => {
    if (!selectedUser) return;
    // Gọi API cập nhật trạng thái ở đây
    console.log(
      `Cập nhật trạng thái user ${selectedUser.username} thành ${newStatus}`
    );
    // Giả sử thành công:
    // Cập nhật local state hoặc refetch data, demo đóng modal
    setEditModalOpen(false);
  };

  // Mở modal cảnh cáo
  const openWarnModal = (user: User) => {
    setSelectedUser(user);
    setWarnMessage("");
    setWarnModalOpen(true);
  };

  // Gửi cảnh cáo (gọi API)
  const sendWarning = () => {
    if (!selectedUser) return;
    console.log(
      `Gửi cảnh cáo cho user ${selectedUser.username}: ${warnMessage}`
    );
    // Gọi API gửi cảnh cáo
    setWarnModalOpen(false);
  };

  // Xử lý sort
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

  // Filter + search + sort users
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Filter trạng thái
    if (filters.status !== "all") {
      filtered = filtered.filter((u) => u.status === filters.status);
    }

    // Filter is_admin
    if (filters.is_admin !== "all") {
      filtered = filtered.filter(
        (u) => u.is_admin.toString() === filters.is_admin
      );
    }

    // Search username, first_name, last_name
    if (filters.searchTerm.trim() !== "") {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(term) ||
          u.first_name.toLowerCase().includes(term) ||
          u.last_name.toLowerCase().includes(term)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const key = sortConfig.key as keyof User;

      let aValue = a[key];
      let bValue = b[key];

      // Nếu là ngày, chuyển về số timestamp để so sánh
      if (key === "created_at" || key === "last_active" || key === "birthday") {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue && bValue && aValue < bValue)
        return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue && bValue && aValue > bValue)
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, filters, sortConfig]);

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
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-4 text-gray-500"
                        >
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                    {filteredUsers.map((user) => (
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
            </>
          )}
        </CardBody>
      </Card>

      {/* Modal Sửa trạng thái */}
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
          <Button color="primary" onClick={saveStatus}>
            Lưu
          </Button>{" "}
          <Button color="secondary" onClick={() => setEditModalOpen(false)}>
            Hủy
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal cảnh cáo */}
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
