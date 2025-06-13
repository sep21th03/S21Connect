import UserProFile from "@/Common/UserProFile";
import { FC, useState } from "react";
import FriendSuggestion from "./FriendSuggestion";
import LikedPages from "./LikedPages";
import { UserAbout } from "@/utils/interfaces/user";

const ContentLeft: FC<{ userProfile: UserAbout | null }> = ({ userProfile }) => {
  const [isFriendSection, setIsFriendSection] = useState(false);
  

  return (
    <div className="content-left">
      {userProfile && <UserProFile userProfile={userProfile} />}
      {isFriendSection && <FriendSuggestion setIsFriendSection={setIsFriendSection}/>}
      <LikedPages />
    </div>
  );
};

export default ContentLeft;
