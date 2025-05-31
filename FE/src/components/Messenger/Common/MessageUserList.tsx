import { FC, useEffect, useState } from "react";
import { Input, InputGroup, InputGroupText, Spinner } from "reactstrap";
import Image from "next/image";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { ShareUser, SelectedShareUser } from "@/utils/interfaces/user";


interface MessageUserListProps {
  userList: ShareUser[];
  selectedUsers: SelectedShareUser[];
  onUserSelect: (userIds: SelectedShareUser[]) => void;
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
}

const MessageUserList: FC<MessageUserListProps> = ({
  userList,
  selectedUsers,
  onUserSelect,
  loading,
  searchTerm,
  setSearchTerm,
}) => {

  const handleUserToggle = (user: ShareUser) => {
    const isSelected = selectedUsers.some((u) => u.id === user.id);
    if (isSelected) {
      onUserSelect(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      onUserSelect([
        ...selectedUsers,
        {
          id: user.id,
          conversation_id: user.conversation_id, 
          username: user.username,
          avatar: user.avatar,
        },
      ]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === userList.length) {
      onUserSelect([]);
    } else {
      onUserSelect(userList.map((user) => ({ id: user.id, conversation_id: user.conversation_id, username: user.username, avatar: user.avatar })));
    }
  };

  return (
    <div className="message-user-list">
      <div className="search-section mb-3">
        <InputGroup>
          <InputGroupText>
            <DynamicFeatherIcon iconName="Search" className="icon-sm" />
          </InputGroupText>
          <Input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="text-muted small">
          Đã chọn: {selectedUsers.length}/{userList.length}
        </span>
        <button
          type="button"
          className="btn btn-link btn-sm p-0"
          onClick={handleSelectAll}
        >
          {selectedUsers.length === userList.length
            ? "Bỏ chọn tất cả"
            : "Chọn tất cả"}
        </button>
      </div>

      <div
        className="user-list-container"
        style={{ maxHeight: "300px", overflowY: "auto" }}
      >
        {loading ? (
          <div className="text-center text-muted py-3">
            <Spinner />
          </div>
        ) : userList.length === 0 ? (
          <div className="text-center text-muted py-3">
            <DynamicFeatherIcon iconName="Users" className="icon-lg mb-2" />
            <p>Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          userList.map((user) => (
            <div
              key={user.id}
              className={`user-item d-flex align-items-center p-2 rounded mb-1 ${
                selectedUsers.some((selectedUser) => selectedUser.id === user.id)
                  ? "bg-primary bg-opacity-10 border border-primary"
                  : "bg-light"
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => handleUserToggle(user)}
            >
              <div className="user-avatar me-3">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.first_name + " " + user.last_name}
                    width={40}
                    height={40}
                    className="rounded-circle"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                    style={{ width: "40px", height: "40px" }}
                  >
                    {user.first_name?.charAt(0).toUpperCase() +
                      user.last_name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </div>

              <div className="user-info flex-grow-1">
                <div className="user-name fw-semibold">
                  {user.first_name + " " + user.last_name || "Unknown User"}
                </div>
                <div className="user-email text-muted small">
                  {user.conversation_id}
                </div>
                {/* {user.latest_message && (
                  <div className="last-message text-muted small">
                    {user.latest_message.type === "image" 
                      ? "📷 Hình ảnh" 
                      : user.latest_message.content?.substring(0, 30) + "..."
                    }
                  </div>
                )} */}
              </div>

              <div className="selection-indicator">
                {/* {selectedUsers.includes(user.other_user.id) ? ( */}
                <DynamicFeatherIcon
                  iconName="CheckCircle"
                  className="text-primary"
                />
                {/* ) : (
                  <DynamicFeatherIcon 
                    iconName="Circle" 
                    className="text-muted" 
                  />
                )} */}
              </div>

              {/* {user.unread_count > 0 && (
                <div className="unread-badge ms-2">
                  <span className="badge bg-danger rounded-pill">
                    {user.unread_count}
                  </span>
                </div>
              )} */}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessageUserList;
