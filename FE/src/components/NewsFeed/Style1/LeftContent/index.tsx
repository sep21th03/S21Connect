import UserProFile from "@/Common/UserProFile";
import { FC } from "react";
import FriendSuggestion from "./FriendSuggestion";
import LikedPages from "./LikedPages";
import { UserAbout } from "@/utils/interfaces/user";

const ContentLeft: FC<{ userProfile: UserAbout | null }> = ({ userProfile }) => {
  return (
    <div className="content-left">
      {userProfile && <UserProFile userProfile={userProfile} />}
      <FriendSuggestion />
      <LikedPages />
    </div>
  );
};

export default ContentLeft;
