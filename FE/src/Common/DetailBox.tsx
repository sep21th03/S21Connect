import { FC, useState } from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { DetailBoxProps } from "./CommonInterFace";
import { ImagePath, PeopleReactThisPost } from "../utils/constant";
import CustomImage from "./CustomImage";
import { toast } from "react-toastify";
import SufiyaElizaSecondPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaSecondPost";
import SufiyaElizaThirdPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaThirdPost";
import SufiyaElizaMultiplePost from "@/components/NewsFeed/Style3/ContentCenter/SufiyaElizaMultiplePost";
import SufiyaElizaFirstPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaFirstPost";
import { useMemo } from "react";

const DetailBox: FC<DetailBoxProps> = ({ heading, span, post }) => {
  const [bookMarkActive, setBookMarkActive] = useState(false);
  const numbers = [1, 2, 3];

  const sharedContent = useMemo(() => {
    if (!post?.shared_post) return null;
  
    switch (post?.shared_post?.type) {
      case "first":
        return (
          <SufiyaElizaFirstPost
            key={post.id}
            post={post.shared_post}
            shouldOpenComments={false}
            highlightCommentId={null}
            highlightReplyId={null}
            isShared={true}
          />
        );
      case "multiple":
        return (
          <SufiyaElizaMultiplePost
            key={post.id}
            post={post.shared_post}
            shouldOpenComments={false}
            highlightCommentId={null}
            highlightReplyId={null}
            isShared={true}
          />
        );
      case "third":
        return (
          <SufiyaElizaThirdPost
            key={post.id}
            post={post.shared_post}
            shouldOpenComments={false}
            highlightCommentId={null}
            highlightReplyId={null}
            isShared={true}
          />
        );
      case "second":
      default:
        return (
          <SufiyaElizaSecondPost
            key={post.id}
            post={post.shared_post}
            shouldOpenComments={false}
            highlightCommentId={null}
            highlightReplyId={null}
            isShared={true}
          />
        );
    }
  }, [post?.shared_post, post?.shared_post?.type, post?.id]);

  return (
    <div
      className={`detail-box ${post?.bg_id ? `${post?.bg_id}` : ""}`}
      style={post?.bg_id ? { padding: "100px 20px 100px 20px" } : {}}
    >
      <h3
        className={`${post?.bg_id ? "text-center" : ""}`}
        style={{ fontSize: "16px", fontWeight: "500", color: "#000" }}
      >
        {post?.content}
      </h3>
      {post?.post_format === "shared" && (
        <div
          className="shared-post-container"
          style={{
            border: "1px solid #000",
            padding: "10px",
            borderRadius: "10px",
            marginTop: "10px",
          }}
        >
          {sharedContent}
        </div>
      )}
      {/* <h5 className="tag" dangerouslySetInnerHTML={{ __html: span }} /> */}
      {/* <p>
        {post?.content}
      </p> */}
      {/* <div className={`bookmark favorite-btn ${bookMarkActive ? "active" : ""}`}>
        <DynamicFeatherIcon iconName="Bookmark" className="iw-14 ih-14" onClick={() => {setBookMarkActive(!bookMarkActive); toast.success(`${bookMarkActive?"un-":""}lưu trữ thành công`);}   }/>
      </div> */}
      {/* <div className="people-likes">
        <ul>
          {numbers.map((data, index) => (
            <li key={index} className="popover-cls bg-size blur-up lazyloaded">
              <CustomImage src={`${ImagePath}/user-sm/${data}.jpg`} className="img-fluid blur-up lazyload bg-img" alt="image"/>
            </li>
          ))}
        </ul>
        <h6>+12 {PeopleReactThisPost}</h6>
      </div> */}
    </div>
  );
};

export default DetailBox;
