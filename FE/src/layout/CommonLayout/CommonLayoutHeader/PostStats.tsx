import { TotalFriends, TotalPosts } from "../../../utils/constant";
import { FC } from "react";

interface PostStatsProps {
  totalPosts: number;
  totalFriends: number;
}

const PostStats: FC<PostStatsProps> = ({totalPosts, totalFriends}) => {
  return (
    <div className="post-stats">
      <ul>
        <li>
          <h3>{totalPosts}</h3>
          <span>{TotalPosts}</span>
        </li>
        <li>
          <h3>{totalFriends}</h3>
          <span>{TotalFriends}</span>
        </li>
      </ul>
    </div>
  );
};

export default PostStats;
