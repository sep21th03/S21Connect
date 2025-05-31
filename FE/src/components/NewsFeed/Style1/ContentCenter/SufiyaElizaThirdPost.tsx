import CommonLikePanel from "@/Common/CommonLikePanel";
import CommonPostReact from "@/Common/CommonPostReact";
import CommonUserHeading from "@/Common/CommonUserHeading";
import DetailBox from "@/Common/DetailBox";
import {
  CelebrationNewAlbum,
  CelebrationSpan,
  ImagePath,
} from "../../../../utils/constant";
import Image from "next/image";
import { FC, useState } from "react";
import { SufiyaElizaThirdPostInterface, Post } from "../Style1Types";

const SufiyaElizaThirdPost: FC<SufiyaElizaThirdPostInterface> = ({
  fourthPost,
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
          id="SufiyaElizaThirdPost"
          postUser={localPost}
          onPostUpdated={(updatedPost: Post) => setLocalPost(updatedPost)}
          onPostDeleted={() => setIsDeleted(true)}
          isShared={isShared}
        />
      )}
      <div className="post-details">
        {!isShared && (
          <DetailBox
            heading={CelebrationNewAlbum}
            span={CelebrationSpan}
            post={localPost}
          />
        )}
        <div className="img-wrapper">
          {fourthPost ? (
            <Image
              src={`${ImagePath}/post/${fourthPost}.jpg`}
              className="img-fluid blur-up lazyloaded"
              alt="image"
              width={523}
              height={542}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: 0,
                paddingBottom: "56%",
                position: "relative",
              }}
            >
              <iframe
                src={localPost?.content}
                style={{ position: "absolute" }}
                className="giphy-embed w-100 h-100"
                allowFullScreen
              />
            </div>
          )}
        </div>
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
              id="SufiyaElizaThirdPost"
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
                heading={CelebrationNewAlbum}
                span={CelebrationSpan}
                post={localPost}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SufiyaElizaThirdPost;
