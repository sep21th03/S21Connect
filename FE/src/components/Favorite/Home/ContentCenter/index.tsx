import React, { FC } from "react";
import SufiyaElizaThirdPost from "../../../NewsFeed/Style1/ContentCenter/SufiyaElizaThirdPost";
import SufiyaElizaSecondPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaSecondPost";
import ShowMorePostIcon from "@/Common/ShowMorePostIcon/ShowMorePostIcon";
import { styleOneMoreComponent } from "@/Data/NewsFeed";
import { useSelector } from "react-redux";
import { RootState } from "@/redux-toolkit/store";

const ContentCenter: FC = () => {
  const level = useSelector((state: RootState) => state.ShowMorePostSlice.favouriteHome);

  return (
    <div className="content-center">
      <div className="post-panel infinite-loader-sec">
        {/* <SufiyaElizaThirdPost fourthPost={null as any} post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false}/>
        <SufiyaElizaSecondPost post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} /> */}
        {styleOneMoreComponent.map((data, index) => level.includes(index) ? (
          <React.Fragment key={index}>
            {data}
          </React.Fragment>
        ) : null)}
      </div>
      <ShowMorePostIcon dataLength={styleOneMoreComponent.length} value="favouriteHome" />
    </div>
  );
};

export default ContentCenter;
