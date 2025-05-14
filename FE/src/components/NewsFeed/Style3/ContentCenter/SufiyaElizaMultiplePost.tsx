import CommonLikePanel from "@/Common/CommonLikePanel";
import CommonUserHeading from "@/Common/CommonUserHeading";
import DetailBox from "@/Common/DetailBox";
import React, { FC, useState } from "react";
import CommonPostReact from "../../../../Common/CommonPostReact/index";
import { BirthdayHeading, BirthdaySpan } from "../../../../utils/constant";
import PostImages from "./PostImages";
import { SufiyaElizaMultiplePostInterFace, Post } from "../../Style1/Style1Types";

const SufiyaElizaMultiplePost: FC<SufiyaElizaMultiplePostInterFace> = ({post}) => {
  const [localPost, setLocalPost] = useState(post);
  const [isDeleted, setIsDeleted] = useState(false);
  if (isDeleted) return null; 
  return (
    <div className="post-wrapper col-grid-box section-t-space d-block">
      <CommonUserHeading id="SufiyaElizaMultiplePost" postUser={localPost}  onPostUpdated={(updatedPost: Post) => setLocalPost(updatedPost)} onPostDeleted={() => setIsDeleted(true)}/>
      <div className="post-details">
        <PostImages post={localPost} />
        <DetailBox heading={BirthdayHeading} span={BirthdaySpan}  post={localPost} />
        <CommonLikePanel reactionCount={localPost?.reaction_counts} total_reactions={localPost?.total_reactions} commentCount={localPost?.total_comments} shareCount={localPost?.total_shares} />
        <CommonPostReact post={localPost} onReactionChange={(data) => setLocalPost({ ...localPost, reaction_counts: data.reaction_counts, total_reactions: data.total_count })} />
      </div>
    </div>
  );
};

export default SufiyaElizaMultiplePost;
