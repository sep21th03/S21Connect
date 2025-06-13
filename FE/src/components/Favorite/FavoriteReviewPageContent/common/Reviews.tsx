import { FC } from "react";
import CustomImage from "../../../../Common/CustomImage";
import { ImagePath, PeopleReactThisPost } from "../../../../utils/constant";
import ReviewsDropdown from "./ReviewsDropdown";
import { Media } from "reactstrap";
import CommonLikePanel from "@/Common/CommonLikePanel";
import CommonPostReact from "@/Common/CommonPostReact";
interface ReviewsInterface {
  review: {
    id: number;
    content: string;
    rate: number;
    created_at: string;
    user: {
      id: string;
      username: string;
      first_name: string;
      last_name: string;
      avatar: string;
    };
  };
}

const Reviews: FC<ReviewsInterface> = ({ review }) => {
  const { content, created_at, user, rate } = review;

  const StarRating: FC<{ rate: number }> = ({ rate }) => {
    const maxStars = 5;

    return (
      <div
        className="star-rating"
        style={{ color: "#FFD700", fontSize: "1.2rem" }}
      >
        {Array.from({ length: maxStars }, (_, i) => (
          <span key={i}>{i < rate ? "★" : "☆"}</span>
        ))}
      </div>
    );
  };

  return (
    <div className="post-wrapper col-grid-box section-t-space d-block">
      <div className="post-title">
        <div className="profile">
          <Media>
            <div className="user-img bg-size blur-up lazyloaded">
              <CustomImage
                src={user.avatar}
                className="img-fluid blur-up lazyload bg-img"
                alt="user"
              />
            </div>
            <Media body>
              <h5>
                {user.first_name} {user.last_name}
                <span> Đánh giá trang này</span>
              </h5>
              <h6>{new Date(created_at).toLocaleString()}</h6>
              <StarRating rate={rate} />
            </Media>
          </Media>
        </div>
        <ReviewsDropdown />
      </div>
      <div className="post-details">
        <div className="detail-box">
          <h4>{content}</h4>
        </div>
        <CommonLikePanel />
        <CommonPostReact
          onReactionChange={() => {}}
          post={null as any}
          shouldOpenComments={false}
          highlightCommentId={null}
          highlightReplyId={null}
        />
      </div>
    </div>
  );
};

export default Reviews;
