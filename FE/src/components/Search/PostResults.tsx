import { Card, CardBody, Row, Col, Button, Input, Label, FormGroup } from "reactstrap";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { useState } from "react";
import SufiyaElizaFirstPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaFirstPost";
import SufiyaElizaSecondPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaSecondPost";
import SufiyaElizaThirdPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaThirdPost";
import SufiyaElizaMultiplePost from "@/components/NewsFeed/Style3/ContentCenter/SufiyaElizaMultiplePost";

interface PostResultsProps {
  posts: any[];
  filters: {
    userType: string;
    dateRange: string;
    postAuthor: string;
    customDateStart: string;
    customDateEnd: string;
  };
  onFilterChange: (filters: any) => void;
}

const PostResults: React.FC<PostResultsProps> = ({
  posts,
  filters,
  onFilterChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const filteredPosts = posts.filter((post) => {
    if (filters.dateRange && filters.dateRange !== "all") {
      const postDate = new Date(post.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - postDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (filters.dateRange) {
        case "today":
          if (diffDays > 1) return false;
          break;
        case "week":
          if (diffDays > 7) return false;
          break;
        case "month":
          if (diffDays > 30) return false;
          break;
        case "year":
          if (diffDays > 365) return false;
          break;
        case "custom":
          if (filters.customDateStart && filters.customDateEnd) {
            const startDate = new Date(filters.customDateStart);
            const endDate = new Date(filters.customDateEnd);
            if (postDate < startDate || postDate > endDate) return false;
          }
          break;
      }
    }

    if (filters.postAuthor && filters.postAuthor !== "all") {
      const authorName = `${post.user?.first_name || ""} ${post.user?.last_name || ""}`.trim().toLowerCase();
      if (!authorName.includes(filters.postAuthor.toLowerCase())) return false;
    }

    return true;
  });

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
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
    <div className="post-results">
      <div className="post-panel infinite-loader-sec section-t-space">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => renderPostByType(post))
        ) : (
          <div className="text-center py-5">
            <DynamicFeatherIcon iconName="FileText" className="text-muted mb-3" />
            <h5>Không tìm thấy bài viết nào</h5>
            <p className="text-muted">
              Không có bài viết nào phù hợp với bộ lọc hiện tại. Hãy thử điều chỉnh bộ lọc.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostResults;