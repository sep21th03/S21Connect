import CommonLikePanel from "@/Common/CommonLikePanel";
import CommonUserHeading from "@/Common/CommonUserHeading";
import DetailBox from "@/Common/DetailBox";
import React, { FC, useState } from "react";
import CommonPostReact from "../../../../Common/CommonPostReact/index";
import { BirthdayHeading, BirthdaySpan } from "../../../../utils/constant";
import PostImages from "./PostImages";
import {
  SufiyaElizaMultiplePostInterFace,
  Post,
} from "../../Style1/Style1Types";

const SufiyaElizaMultiplePost: FC<SufiyaElizaMultiplePostInterFace> = ({
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
    <div className="post-wrapper col-grid-box section-t-space d-block">
      {!isShared && (
        <CommonUserHeading
          id="SufiyaElizaMultiplePost"
          postUser={localPost}
          onPostUpdated={(updatedPost: Post) => setLocalPost(updatedPost)}
          onPostDeleted={() => setIsDeleted(true)}
          isShared={isShared}
        />
      )}
      <div className="post-details">
        {!isShared && (
          <DetailBox
            heading={BirthdayHeading}
            span={BirthdaySpan}
            post={localPost}
          />
        )}
        <PostImages
          post={localPost}
          onReactionChange={(data) =>
            setLocalPost({
              ...localPost,
              reaction_counts: data.reaction_counts,
              total_reactions: data.total_count,
            })
          }
        />
        {!isShared && (
          <>
            <CommonLikePanel
              reactionCount={localPost?.reaction_counts}
              total_reactions={localPost?.total_reactions}
              commentCount={localPost?.total_comments}
              shareCount={localPost?.total_shares}
            />
            <CommonPostReact
              post={localPost}
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
          <>
            <CommonUserHeading
              id="SufiyaElizaMultiplePost"
              postUser={localPost}
              onPostUpdated={(updatedPost: Post) => setLocalPost(updatedPost)}
              onPostDeleted={() => setIsDeleted(true)}
              isShared={isShared}
            />
            <div
              className="blockquote"
              style={{
                borderLeftColor: "#65686c",
                borderLeftWidth: "4px",
                borderLeftStyle: "solid",
                paddingRight: "20px",
                marginTop: "10px",
                marginLeft: "16px",
              }}
            >
              <DetailBox
                heading={BirthdayHeading}
                span={BirthdaySpan}
                post={localPost}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SufiyaElizaMultiplePost;
