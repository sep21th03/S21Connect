import { FC, useState } from "react";
import PostDetails from "./PostDetails";
import CommonUserHeading from "@/Common/CommonUserHeading";
import { SufiyaElizaFirstPostInterFace, Post } from "../../Style1Types";

const SufiyaElizaFirstPost: FC<SufiyaElizaFirstPostInterFace> = ({
  className,
  post,
  shouldOpenComments,
  highlightCommentId,
  highlightReplyId,
  isShared,
}) => {
  const [localPost, setLocalPost] = useState(post);
  const [isDeleted, setIsDeleted] = useState(false);
  if (isDeleted) return null;

  return (
    <div
      className={`post-wrapper col-grid-box d-block section-t-space ${
        className ? className : ""
      } `}
    >
      {!isShared && (
        <CommonUserHeading
          id="SufiyaElizaFirstPost"
          postUser={localPost}
          onPostUpdated={(updatedPost: Post) => setLocalPost(updatedPost)}
          onPostDeleted={() => setIsDeleted(true)}
          isShared={isShared}
        />
      )}
      <PostDetails
        post={localPost}
        localPost={localPost}
        setLocalPost={setLocalPost}
        shouldOpenComments={shouldOpenComments}
        highlightCommentId={highlightCommentId}
        highlightReplyId={highlightReplyId}
        isShared={isShared}
      />
      {isShared && (
        <CommonUserHeading
          id="SufiyaElizaFirstPost"
          postUser={localPost}
          onPostUpdated={(updatedPost: Post) => setLocalPost(updatedPost)}
          onPostDeleted={() => setIsDeleted(true)}
          isShared={isShared}
        />
      )}
    </div>
  );
};

export default SufiyaElizaFirstPost;
