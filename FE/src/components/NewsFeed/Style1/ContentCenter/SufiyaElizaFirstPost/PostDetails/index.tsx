import { FC } from "react";
import PostImage from "./PostImage";
import DetailBox from "@/Common/DetailBox";
import { BirthdayHeading, BirthdaySpan } from "../../../../../../utils/constant";
import CommonLikePanel from "@/Common/CommonLikePanel";
import CommonPostReact from "@/Common/CommonPostReact";
import { PostDetailInterFace } from "../../../Style1Types";

const PostDetails: FC<PostDetailInterFace> = ({post,localPost,setLocalPost}) => {
  return (
    <div className="post-details">
      <PostImage post={post}  />
      <DetailBox heading={BirthdayHeading} span={BirthdaySpan}  post={post}/>
      <CommonLikePanel reactionCount={post?.reaction_counts} total_reactions={post?.total_reactions} commentCount={post?.total_comments} shareCount={post?.total_shares} />
      <CommonPostReact post={post} onReactionChange={(data) => setLocalPost({ ...localPost, reaction_counts: data.reaction_counts, total_reactions: data.total_count })} />
    </div>
  );
};

export default PostDetails;
