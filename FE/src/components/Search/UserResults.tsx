import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface UserResultsProps {
  users: any[];
  friends: any[];
  friendsOfFriends: any[];
  strangers: any[];
  filters: {
    userType: string;
  };
  onFilterChange: (filters: any) => void;
}

const UserResults: React.FC<UserResultsProps> = ({
  users,
  friends,
  friendsOfFriends,
  strangers,
  filters,
  onFilterChange,
}) => {
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);

  const filteredUsers = useMemo(() => {
    switch (filters.userType) {
      case "friends":
        return friends;
      case "friendsOfFriends":
        return friendsOfFriends;
      default:
        return users;
    }
  }, [users, friends, friendsOfFriends, filters.userType]);

  const displayUsers = showMore ? filteredUsers : filteredUsers.slice(0, 12);

  const handleUserClick = (user: any) => {
    router.push(`/profile/timeline/${user.username}`);
  };

  const handleAddFriend = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSendMessage = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/messages/${userId}`);
  };

  const getUserRelationshipBadge = (user: any) => {
    if (user.relationship === "friend") {
      return <span className="badge bg-success small">Bạn bè</span>;
    }
    if (user.relationship === "friend_of_friend") {
      return <span className="badge bg-info small">Bạn của bạn</span>;
    }
    return null;
  };

  return (
    <div className="user-results">
      <div className="d-lg-none mb-3">
        <Card>
          <CardBody className="p-3">
            <h6 className="mb-3">Lọc theo mối quan hệ</h6>
            <Form>
              <FormGroup>
                <div className="form-check">
                  <Input
                    type="radio"
                    name="userType"
                    id="mobile-userType-all"
                    checked={filters.userType === "all"}
                    onChange={() => onFilterChange({ userType: "all" })}
                  />
                  <Label check for="mobile-userType-all">
                    Tất cả mọi người ({users.length})
                  </Label>
                </div>
                <div className="form-check">
                  <Input
                    type="radio"
                    name="userType"
                    id="mobile-userType-friends"
                    checked={filters.userType === "friends"}
                    onChange={() => onFilterChange({ userType: "friends" })}
                  />
                  <Label check for="mobile-userType-friends">
                    Chỉ bạn bè ({friends.length})
                  </Label>
                </div>
                <div className="form-check">
                  <Input
                    type="radio"
                    name="userType"
                    id="mobile-userType-friendsOfFriends"
                    checked={filters.userType === "friendsOfFriends"}
                    onChange={() =>
                      onFilterChange({ userType: "friendsOfFriends" })
                    }
                  />
                  <Label check for="mobile-userType-friendsOfFriends">
                    Bạn của bạn ({friendsOfFriends.length})
                  </Label>
                </div>
              </FormGroup>
            </Form>
          </CardBody>
        </Card>
      </div>

      <div className="results-header mb-4">
        <h5>
          Tìm thấy {filteredUsers.length} người dùng
          {filters.userType === "friends" && " trong danh sách bạn bè"}
          {filters.userType === "friendsOfFriends" && " trong bạn của bạn"}
        </h5>
      </div>

      {filteredUsers.length > 0 ? (
        <>
          <Row className="justify-content-center">
            {displayUsers.map((user: any) => (
              <Col lg={6} md={4} sm={6} key={user.id} className="mb-4">
                <Card
                  className="user-card h-100 cursor-pointer"
                  onClick={() => handleUserClick(user)}
                >
                  <CardBody className="d-flex align-items-center justify-content-between p-3 rounded mb-2">
                    <div className="d-flex align-items-center">
                      <div className="me-3 position-relative">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="rounded-circle"
                            width="56"
                            height="56"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            className="avatar-placeholder rounded-circle bg-primary d-flex align-items-center justify-content-center"
                            style={{ width: "56px", height: "56px" }}
                          >
                            <span className="text-white fw-bold">
                              {user.first_name?.[0]}
                              {user.last_name?.[0]}
                            </span>
                          </div>
                        )}

                        {user.is_online && (
                          <div
                            className="online-indicator position-absolute bg-success rounded-circle"
                            style={{
                              width: "12px",
                              height: "12px",
                              bottom: "0",
                              right: "0",
                              border: "2px solid rgb(255 255 255)",
                            }}
                          />
                        )}
                      </div>

                      <div>
                        <h6
                          className="mb-1"
                          style={{ fontSize: "15px" }}
                        >
                          {user.name}
                        </h6>
                        <div className="text-muted small d-flex align-items-center flex-wrap">
                          {user.relationship === "friend" && (
                            <span className="me-1">Bạn bè</span>
                          )}
                        </div>

                        {user.mutual_friends_count > 0 && (
                          <div className="small mt-1 d-flex align-items-center">
                            <DynamicFeatherIcon iconName="Users" className="me-1" />
                            {user.mutual_friends_count} bạn chung
                          </div>
                        )}
                      </div>
                    </div>

                    {user.relationship === "friend" && (
                      <Button
                        className="btn btn-sm btn-solid mt-2"
                        // onClick={() => handleSendMessage(user.id)}
                      >
                        Nhắn tin
                      </Button>
                    )}
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          {!showMore && filteredUsers.length > 12 && (
            <div className="text-center mt-4">
              <Button color="outline-primary" onClick={() => setShowMore(true)}>
                Xem thêm {filteredUsers.length - 12} người
              </Button>
            </div>
          )}

          {showMore && filteredUsers.length > 50 && (
            <div className="text-center mt-4">
              <p className="text-muted">
                Hiển thị {displayUsers.length} / {filteredUsers.length} kết quả
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-5">
          <DynamicFeatherIcon iconName="Users" className="text-muted mb-3" />
          <h5>Không tìm thấy người dùng nào</h5>
          <p className="text-muted">
            {filters.userType === "friends" &&
              "Không có bạn bè nào phù hợp với từ khóa tìm kiếm."}
            {filters.userType === "friendsOfFriends" &&
              "Không có bạn của bạn nào phù hợp với từ khóa tìm kiếm."}
            {filters.userType === "all" &&
              "Không có người dùng nào phù hợp với từ khóa tìm kiếm."}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserResults;
