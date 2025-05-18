import { FC } from "react";
import OptionList from "./OptionList";
import PostStats from "./PostStats";
import { UserStats } from "@/utils/interfaces/user";

const RightHeader: FC<UserStats> = ({ total_posts, total_friends }) => {
  return (
    <div className="header-right">
      {total_posts && total_friends && (
        <PostStats totalPosts={total_posts} totalFriends={total_friends} />
      )}
      <OptionList />
    </div>
  );
};

export default RightHeader;
