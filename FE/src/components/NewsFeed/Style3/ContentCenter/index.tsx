import CreatePost from "@/Common/CreatePost";
import SufiyaElizaThirdPost from "../../Style1/ContentCenter/SufiyaElizaThirdPost";
import SufiyaElizaFirstPost from "../../Style1/ContentCenter/SufiyaElizaFirstPost";
import SufiyaElizaSecondPost from "../../Style1/ContentCenter/SufiyaElizaSecondPost";
import GemixStore from "./GemixStore";
import SufiyaElizaMultiplePost from "./SufiyaElizaMultiplePost";
import { styleTwoMoreComponent } from "@/Data/NewsFeed";
import ShowMorePostIcon from "@/Common/ShowMorePostIcon/ShowMorePostIcon";
import { useSelector } from "react-redux";
import { RootState } from "@/redux-toolkit/store";

const ContentCenter = () => {
  const level = useSelector((state: RootState) => state.ShowMorePostSlice.style3);

  return (
    <div className="content-center">
      <CreatePost onPostCreated={() => {}} />
      <div className="post-panel infinite-loader-sec section-t-space">
        <SufiyaElizaThirdPost post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
        <GemixStore/>
        <SufiyaElizaThirdPost fourthPost={2} post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
        <SufiyaElizaFirstPost post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
        <SufiyaElizaMultiplePost post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
        {styleTwoMoreComponent.map((data, index) => (level.includes(index) ? data : ""))}
      </div>
      <ShowMorePostIcon dataLength={styleTwoMoreComponent.length} value="style3" />
    </div>
  );
};

export default ContentCenter;
