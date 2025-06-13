import { FC } from "react";
import LikePageHeader from "./LikePageHeader";
import LikePageListContent from "./LikePageListContent";

const LikePage: FC<{ pageFollows: any[] }> = ({ pageFollows }) => {
  return (
    <div className="page-list section-t-space">
      <LikePageHeader count={pageFollows?.length} />
      <LikePageListContent pageFollows={pageFollows} />
    </div>
  );
};

export default LikePage;
