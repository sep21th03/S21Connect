import { FC } from "react";
import PostImage from "./PostImage";
import DetailBox from "@/Common/DetailBox";
import {
  BirthdayHeading,
  BirthdaySpan,
} from "../../../../../../utils/constant";
import CommonLikePanel from "@/Common/CommonLikePanel";
import CommonPostReact from "@/Common/CommonPostReact";
import { PostDetailInterFace } from "../../../Style1Types";

const PostDetails: FC<PostDetailInterFace> = ({
  post,
  localPost,
  setLocalPost,
  shouldOpenComments,
  highlightCommentId,
  highlightReplyId,
  isShared,
}) => {
  return (
    <div className="post-details">
      {!isShared && (
        <DetailBox heading={BirthdayHeading} span={BirthdaySpan} post={post} />
      )}
      <PostImage
        post={post}
        localPost={localPost}
        setLocalPost={setLocalPost}
        shouldOpenComments={shouldOpenComments}
        highlightCommentId={highlightCommentId}
        highlightReplyId={highlightReplyId}
        isShared={isShared}
      />
      {!isShared && (
        <>
          <CommonLikePanel
            reactionCount={post?.reaction_counts}
            total_reactions={post?.total_reactions}
            commentCount={post?.total_comments}
            shareCount={post?.total_shares}
          />
          <CommonPostReact
            post={post}
            onReactionChange={(data) =>
              setLocalPost({
                ...localPost,
                reaction_counts: data.reaction_counts,
                total_reactions: data.total_count,
              })
            }
            shouldOpenComments={shouldOpenComments}
            highlightCommentId={highlightCommentId}
            highlightReplyId={highlightReplyId}
          />
        </>
      )}
      {isShared && (
        <DetailBox heading={BirthdayHeading} span={BirthdaySpan} post={post} />
      )}
    </div>
  );
};

export default PostDetails;
