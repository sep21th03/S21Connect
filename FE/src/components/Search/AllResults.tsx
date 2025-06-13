import { Card, CardBody, Row, Col, Button } from "reactstrap";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SufiyaElizaFirstPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaFirstPost";
import SufiyaElizaSecondPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaSecondPost";
import SufiyaElizaThirdPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaThirdPost";
import SufiyaElizaMultiplePost from "@/components/NewsFeed/Style3/ContentCenter/SufiyaElizaMultiplePost";
import fanpageService from "@/service/fanpageService";

interface AllResultsProps {
  searchData: {
    users: any[];
    posts: any[];
    pages: any[];
    friends: any[];
    friendsOfFriends: any[];
    strangers: any[];
  };
  keyword: string;
  onTabChange: (tab: "all" | "users" | "posts" | "pages") => void;
}

const AllResults: React.FC<AllResultsProps> = ({
  searchData,
  keyword,
  onTabChange,
}) => {
  const router = useRouter();
  const [showMoreUsers, setShowMoreUsers] = useState(false);
  const [showMorePosts, setShowMorePosts] = useState(false);
  const [showMorePages, setShowMorePages] = useState(false);
  const [followingPages, setFollowingPages] = useState<Set<string>>(new Set());

  const typeMap: Record<string, string> = {
    community: "Cộng đồng",
    brand: "Thương hiệu",
    public_figure: "Người của công chúng",
    business: "Doanh nghiệp",
    entertainment: "Giải trí",
    personal: "Cá nhân",
    other: "Khác",
  };

  const displayUsers = showMoreUsers
    ? searchData.users
    : searchData.users.slice(0, 3);
  const displayPosts = showMorePosts
    ? searchData.posts
    : searchData.posts.slice(0, 3);
  const displayPages = showMorePages
    ? searchData.pages
    : searchData.pages.slice(0, 3);

  const handleUserClick = (user: any) => {
    router.push(`/profile/timeline/${user.username}`);
  };

  const handlePageClick = (page: any) => {
    router.push(`/favourite/home/${page.slug}`);
  };

  const handleFollow = async (pageId: string, isFollowing: boolean) => {
    try {
      const response = isFollowing ? await fanpageService.unfollowPage(pageId) : await fanpageService.followPage(pageId);
      if (response) {
        handleFollowToggle(pageId, !isFollowing);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } 
  };

  const handleFollowToggle = (pageId: string, currentFollowStatus: boolean) => {
    const newFollowingPages = new Set(followingPages);
    if (currentFollowStatus || followingPages.has(pageId)) {
      newFollowingPages.delete(pageId);
    } else {
      newFollowingPages.add(pageId);
    }
    setFollowingPages(newFollowingPages);
  };

  const isPageFollowed = (pageId: string, originalStatus: boolean) => {
    if (followingPages.has(pageId)) {
      return !originalStatus; 
    }
    return originalStatus;
  };

  const renderPostByType = (post: any) => {
    switch (post.type) {
      case "first":
        return (
          <SufiyaElizaFirstPost
            key={post.id}
            post={post}
            shouldOpenComments={false}
            highlightCommentId={null}
            highlightReplyId={null}
            isShared={false}
          />
        );
      case "multiple":
        return (
          <SufiyaElizaMultiplePost
            key={post.id}
            post={post}
            shouldOpenComments={false}
            highlightCommentId={null}
            highlightReplyId={null}
            isShared={false}
          />
        );
      case "third":
        return (
          <SufiyaElizaThirdPost
            key={post.id}
            post={post}
            shouldOpenComments={false}
            highlightCommentId={null}
            highlightReplyId={null}
            isShared={false}
          />
        );
      case "second":
      default:
        return (
          <SufiyaElizaSecondPost
            key={post.id}
            post={post}
            shouldOpenComments={false}
            highlightCommentId={null}
            highlightReplyId={null}
            isShared={false}
          />
        );
    }
  };

  return (
    <div className="all-results">
      {searchData.users.length > 0 && (
        <div className="mb-4">

          <Row className="justify-content-center">
            {displayUsers.map((user: any) => (
              <Col lg={4} md={6} key={user.id} className="mb-3">
                <Card
                  className="user-card h-100 cursor-pointer"
                  onClick={() => handleUserClick(user)}
                >
                  <CardBody className="text-start p-3">
                    <div className="user-avatar mb-2">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="rounded-circle"
                          width="60"
                          height="60"
                        />
                      ) : (
                        <div
                          className="avatar-placeholder rounded-circle bg-primary d-flex align-items-center justify-content-center"
                          style={{ width: "60px", height: "60px" }}
                        >
                          <span className="text-white fw-bold">
                            {user.name?.[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <h6 className="user-name mb-1">{user.name}</h6>
                    <p className="text-muted small mb-2">@{user.username}</p>
                    {user.mutual_friends_count > 0 && (
                      <p className="text-muted small mt-1 d-flex align-items-center">
                        <DynamicFeatherIcon iconName="Users" className="me-1" />
                        {user.mutual_friends_count} bạn chung
                      </p>
                    )}
                    {user.relationship === "friend" && (
                      <>
                        <button
                          className="btn btn-sm btn-solid mt-2 w-100"
                          // onClick={() => handleMessage(user.id)}
                        >
                          Nhắn tin
                        </button>
                      </>
                    )}
                    {user.relationship === "friend_of_friend" && (
                      <span className="badge bg-info small">Bạn của bạn</span>
                    )}
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          {!showMoreUsers && searchData.users.length > 3 && (
            <div className="text-center">
              <Button
                color="outline-primary"
                onClick={() => setShowMoreUsers(true)}
              >
                Xem thêm {searchData.users.length - 3} người
              </Button>
            </div>
          )}
        </div>
      )}

      {searchData.posts.length > 0 && (
        <div className="mb-4">

          <div className="post-panel infinite-loader-sec section-t-space">
            {displayPosts.map((post) => renderPostByType(post))}
          </div>

          {!showMorePosts && searchData.posts.length > 3 && (
            <div className="text-center">
              <Button
                color="outline-primary"
                onClick={() => setShowMorePosts(true)}
              >
                Xem thêm {searchData.posts.length - 3} bài viết
              </Button>
            </div>
          )}
        </div>
      )}

      {searchData.pages.length > 0 && (
        <div className="mb-4">

          <Row className="justify-content-center">
            {displayPages.map((page: any) => (
              <Col lg={6} md={8} key={page.id} className="mb-3" style={{ width: "500px" }}>
                <Card className="shadow-sm">
                  <CardBody className="d-flex flex-column">
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        {page.avatar ? (
                          <img
                            src={page.avatar}
                            alt={page.name}
                            className="rounded-circle"
                            width="60"
                            height="60"
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-info d-flex align-items-center justify-content-center"
                            style={{ width: "60px", height: "60px" }}
                          >
                            <DynamicFeatherIcon
                              iconName="Flag"
                              className="text-white"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <h4 className="mb-1 d-flex align-items-center cursor-pointer" onClick={() => handlePageClick(page)}>
                          {page.name}
                        </h4>
                        <div className="text-muted small mb-1">
                          {typeMap[page.page_type]} · {page.followers_count || 0} người theo
                          dõi
                        </div>
                        {page.description && (
                          <div className="fw-semibold text-uppercase small mb-2">
                            {page.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button className="w-100 btn-solid btn" onClick={() => handleFollow(page.id, isPageFollowed(page.id, page.is_followed))}>
                        {isPageFollowed(page.id, page.is_followed) ? "Đang theo dõi" : "Theo dõi"}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          {!showMorePages && searchData.pages.length > 3 && (
            <div className="text-center">
              <Button
                color="outline-primary"
                onClick={() => setShowMorePages(true)}
              >
                Xem thêm {searchData.pages.length - 3} trang
              </Button>
            </div>
          )}
        </div>
      )}

      {searchData.users.length === 0 &&
        searchData.posts.length === 0 &&
        searchData.pages.length === 0 && (
          <div className="text-center py-5">
            <DynamicFeatherIcon iconName="Search" className="text-muted mb-3" />
            <h5>Không tìm thấy kết quả</h5>
            <p className="text-muted">
              Không có kết quả nào cho từ khóa "{keyword}". Hãy thử với từ khóa
              khác.
            </p>
          </div>
        )}
    </div>
  );
};

export default AllResults;
