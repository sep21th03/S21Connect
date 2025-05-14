import CommonLikePanel from "@/Common/CommonLikePanel";
import CommonPostReact from "@/Common/CommonPostReact";
import CommonUserHeading from "@/Common/CommonUserHeading";
import DetailBox from "@/Common/DetailBox";
import { CelebrationNewAlbum, CelebrationSpan } from "../../../../utils/constant";
import { FC, useState } from "react";
import { Post, SufiyaElizaSecondPostInterFace } from "../Style1Types";

const SufiyaElizaSecondPost: FC<SufiyaElizaSecondPostInterFace> = ({post}) => {
  const [localPost, setLocalPost] = useState(post);
  const [isDeleted, setIsDeleted] = useState(false);
  if (isDeleted) return null; 
  return (
    <div className="post-wrapper col-grid-box section-t-space d-block">
      <CommonUserHeading id="SufiyaElizaSecondPost" postUser={localPost} onPostUpdated={(updatedPost: Post) => setLocalPost(updatedPost)} onPostDeleted={() => setIsDeleted(true)}/>
      <div className="post-details">
        <DetailBox heading={CelebrationNewAlbum} span={CelebrationSpan} post={localPost} />
        <CommonLikePanel reactionCount={localPost?.reaction_counts} total_reactions={localPost?.total_reactions} commentCount={localPost?.total_comments} shareCount={localPost?.total_shares} />
        <CommonPostReact post={localPost} onReactionChange={(data) => setLocalPost({ ...localPost, reaction_counts: data.reaction_counts, total_reactions: data.total_count })} />
      </div>
    </div>
  );
};

export default SufiyaElizaSecondPost;
