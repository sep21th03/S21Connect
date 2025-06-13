import { Card, CardBody, Row, Col, Button, Input, Label, FormGroup } from "reactstrap";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { useState } from "react";
import { useRouter } from "next/navigation";
import fanpageService from "@/service/fanpageService";

interface PageResultsProps {
  pages: any[];
  filters?: {
    pageType: string;
  };
  onFilterChange?: (filters: any) => void;
}

const PageResults: React.FC<PageResultsProps> = ({
  pages,
  filters = { pageType: "all" },
  onFilterChange,
}) => {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [followingPages, setFollowingPages] = useState<Set<string>>(new Set());

  // Type mapping for display
  const typeMap: { [key: string]: string } = {
    personal: "Cá nhân",
    business: "Doanh nghiệp", 
    organization: "Tổ chức",
    community: "Cộng đồng",
    brand: "Thương hiệu",
    public_figure: "Nhân vật công chúng",
    entertainment: "Giải trí",
    other: "Khác"
  };

  // Filter pages based on current filters
  const filteredPages = pages.filter((page) => {
    if (filters.pageType && filters.pageType !== "all") {
      if (page.page_type !== filters.pageType) return false;
    }
    return true;
  });

  const handleFilterChange = (key: string, value: string) => {
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        [key]: value,
      });
    }
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

  return (
    <div className="page-results">
      {onFilterChange && (
        <Card className="filter-card mb-4">
          <CardBody>
            <div className="d-flex align-items-center justify-content-between">
              <h6 className="mb-0">
                <DynamicFeatherIcon iconName="Filter" className="me-2" />
                Bộ lọc trang
              </h6>
              <Button
                color="link"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "Ẩn bộ lọc" : "Hiển thị bộ lọc"}
                <DynamicFeatherIcon
                  iconName={showFilters ? "ChevronUp" : "ChevronDown"}
                  className="ms-1"
                />
              </Button>
            </div>

            {showFilters && (
              <Row className="mt-3">
                <Col md={6}>
                  <FormGroup>
                    <Label for="pageType">Loại trang</Label>
                    <Input
                      type="select"
                      id="pageType"
                      value={filters.pageType}
                      onChange={(e) => handleFilterChange("pageType", e.target.value)}
                    >
                      <option value="all">Tất cả</option>
                      <option value="personal">Cá nhân</option>
                      <option value="business">Doanh nghiệp</option>
                      <option value="organization">Tổ chức</option>
                      <option value="community">Cộng đồng</option>
                      <option value="brand">Thương hiệu</option>
                      <option value="public_figure">Nhân vật công chúng</option>
                      <option value="entertainment">Giải trí</option>
                      <option value="other">Khác</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
            )}
          </CardBody>
        </Card>
      )}


      <div className="pages-list">
        {filteredPages.length > 0 ? (
          <Row className="justify-content-center">
            {filteredPages.map((page: any) => (
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
                          {typeMap[page.page_type] || page.page_type} · {page.followers_count || 0} người theo dõi
                        </div>
                        {page.description && (
                          <div className="fw-semibold text-uppercase small mb-2">
                            {page.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button 
                        className="w-100 btn-solid btn"
                        onClick={() => handleFollow(page.id, page.is_followed)}
                      >
                        {isPageFollowed(page.id, page.is_followed) ? "Đang theo dõi" : "Theo dõi"}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-5">
            <DynamicFeatherIcon iconName="Flag" className="text-muted mb-3" />
            <h5>Không tìm thấy trang nào</h5>
            <p className="text-muted">
              Không có trang nào phù hợp với bộ lọc hiện tại. Hãy thử điều chỉnh bộ lọc.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageResults;