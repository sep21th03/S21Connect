"use client";

import {
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";

interface SearchSidebarProps {
  activeTab: "all" | "users" | "posts" | "pages";
  onTabChange: (tab: "all" | "users" | "posts" | "pages") => void;
  filters: {
    userType: string;
    dateRange: string;
    postAuthor: string;
    customDateStart: string;
    customDateEnd: string;
  };
  onFilterChange: (filters: any) => void;
  searchData: {
    users: any[];
    posts: any[];
    pages: any[];
    friends: any[];
    friendsOfFriends: any[];
    strangers: any[];
  };
}

const SearchSidebar = ({
  activeTab,
  onTabChange,
  filters,
  onFilterChange,
  searchData,
}: SearchSidebarProps) => {
  return (
    <div className="search-sidebar p-3">
      <Card className="mb-3">
        <CardBody className="p-3">
          <h3 className="mb-3 text-center">Lọc kết quả</h3>
          <Nav vertical className="search-nav">
            <NavItem>
              <NavLink
                active={activeTab === "all"}
                onClick={() => onTabChange("all")}
                className="cursor-pointer d-flex align-items-center justify-content-between"
              >
                <span>
                  <DynamicFeatherIcon iconName="Grid" className="me-2" />
                  Tất cả
                </span>
                <span className="badge bg-primary">
                  {searchData?.users?.length +
                    searchData?.posts?.length +
                    searchData?.pages?.length}
                </span>
              </NavLink>
            </NavItem>

            <NavItem>
              <NavLink
                active={activeTab === "users"}
                onClick={() => onTabChange("users")}
                className="cursor-pointer d-flex align-items-center justify-content-between"
              >
                <span>
                  <DynamicFeatherIcon iconName="Users" className="me-2" />
                  Mọi người
                </span>
                <span className="badge bg-info">
                  {searchData?.users?.length}
                </span>
              </NavLink>
            </NavItem>

            <NavItem>
              <NavLink
                active={activeTab === "posts"}
                onClick={() => onTabChange("posts")}
                className="cursor-pointer d-flex align-items-center justify-content-between"
              >
                <span>
                  <DynamicFeatherIcon iconName="FileText" className="me-2" />
                  Bài viết
                </span>
                <span className="badge bg-success">
                  {searchData?.posts?.length}
                </span>
              </NavLink>
            </NavItem>

            <NavItem>
              <NavLink
                active={activeTab === "pages"}
                onClick={() => onTabChange("pages")}
                className="cursor-pointer d-flex align-items-center justify-content-between"
              >
                <span>
                  <DynamicFeatherIcon iconName="Flag" className="me-2" />
                  Trang
                </span>
                <span className="badge bg-warning">
                  {searchData?.pages?.length}
                </span>
              </NavLink>
            </NavItem>
          </Nav>
        </CardBody>
      </Card>

      {activeTab === "users" && (
        <Card className="mb-3">
          <CardBody className="p-3">
            <h4 className="mb-3">Lọc theo mối quan hệ</h4>
            <Form>
              <FormGroup>
                <div className="form-check">
                  <Input
                    type="radio"
                    name="userType"
                    id="userType-all"
                    checked={filters.userType === "all"}
                    onChange={() => onFilterChange({ userType: "all" })}
                  />
                  <Label check for="userType-all">
                    Tất cả mọi người
                  </Label>
                </div>
                <div className="form-check">
                  <Input
                    type="radio"
                    name="userType"
                    id="userType-friends"
                    checked={filters.userType === "friends"}
                    onChange={() => onFilterChange({ userType: "friends" })}
                  />
                  <Label check for="userType-friends">
                    Chỉ bạn bè ({searchData?.friends?.length})
                  </Label>
                </div>
                <div className="form-check">
                  <Input
                    type="radio"
                    name="userType"
                    id="userType-friendsOfFriends"
                    checked={filters.userType === "friendsOfFriends"}
                    onChange={() =>
                      onFilterChange({ userType: "friendsOfFriends" })
                    }
                  />
                  <Label check for="userType-friendsOfFriends">
                    Bạn của bạn ({searchData?.friendsOfFriends?.length})
                  </Label>
                </div>
              </FormGroup>
            </Form>
          </CardBody>
        </Card>
      )}

      {activeTab === "posts" && (
        <>
          <Card className="mb-3">
            <CardBody className="p-3">
              <h4 className="mb-3">Lọc theo thời gian</h4>
              <Form>
                <FormGroup>
                  <div className="form-check">
                    <Input
                      type="radio"
                      name="dateRange"
                      id="dateRange-all"
                      checked={filters.dateRange === "all"}
                      onChange={() => onFilterChange({ dateRange: "all" })}
                    />
                    <Label check for="dateRange-all">
                      Tất cả thời gian
                    </Label>
                  </div>
                  <div className="form-check">
                    <Input
                      type="radio"
                      name="dateRange"
                      id="dateRange-today"
                      checked={filters.dateRange === "today"}
                      onChange={() => onFilterChange({ dateRange: "today" })}
                    />
                    <Label check for="dateRange-today">
                      Hôm nay
                    </Label>
                  </div>
                  <div className="form-check">
                    <Input
                      type="radio"
                      name="dateRange"
                      id="dateRange-thisWeek"
                      checked={filters.dateRange === "thisWeek"}
                      onChange={() => onFilterChange({ dateRange: "thisWeek" })}
                    />
                    <Label check for="dateRange-thisWeek">
                      Tuần này
                    </Label>
                  </div>
                  <div className="form-check">
                    <Input
                      type="radio"
                      name="dateRange"
                      id="dateRange-thisMonth"
                      checked={filters.dateRange === "thisMonth"}
                      onChange={() =>
                        onFilterChange({ dateRange: "thisMonth" })
                      }
                    />
                    <Label check for="dateRange-thisMonth">
                      Tháng này
                    </Label>
                  </div>
                  <div className="form-check">
                    <Input
                      type="radio"
                      name="dateRange"
                      id="dateRange-custom"
                      checked={filters.dateRange === "custom"}
                      onChange={() => onFilterChange({ dateRange: "custom" })}
                    />
                    <Label check for="dateRange-custom">
                      Tùy chọn
                    </Label>
                  </div>
                </FormGroup>

                {filters.dateRange === "custom" && (
                  <div className="mt-3">
                    <FormGroup>
                      <Label>Từ ngày</Label>
                      <Input
                        type="date"
                        value={filters.customDateStart}
                        onChange={(e) =>
                          onFilterChange({ customDateStart: e.target.value })
                        }
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Đến ngày</Label>
                      <Input
                        type="date"
                        value={filters.customDateEnd}
                        onChange={(e) =>
                          onFilterChange({ customDateEnd: e.target.value })
                        }
                      />
                    </FormGroup>
                  </div>
                )}
              </Form>
            </CardBody>
          </Card>

          <Card className="mb-3">
            <CardBody className="p-3">
              <h4 className="mb-3">Lọc theo người đăng</h4>
              <Form>
                <FormGroup>
                  <div className="form-check">
                    <Input
                      type="radio"
                      name="postAuthor"
                      id="postAuthor-all"
                      checked={filters.postAuthor === "all"}
                      onChange={() => onFilterChange({ postAuthor: "all" })}
                    />
                    <Label check for="postAuthor-all">
                      Tất cả
                    </Label>
                  </div>
                  <div className="form-check">
                    <Input
                      type="radio"
                      name="postAuthor"
                      id="postAuthor-friends"
                      checked={filters.postAuthor === "friends"}
                      onChange={() => onFilterChange({ postAuthor: "friends" })}
                    />
                    <Label check for="postAuthor-friends">
                      Chỉ bạn bè
                    </Label>
                  </div>
                </FormGroup>
              </Form>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
};

export default SearchSidebar;
