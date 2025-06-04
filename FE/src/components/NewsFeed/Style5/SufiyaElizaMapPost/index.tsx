import CommonLikePanel from "@/Common/CommonLikePanel";
import CommonPostReact from "@/Common/CommonPostReact";
import CommonUserHeading from "@/Common/CommonUserHeading";
import DetailBox from "@/Common/DetailBox";
import { MapHeading, MapSpan } from "../../../../utils/constant";
import { FC } from "react";
import MapImage from "./MapImage";

const SufiyaElizaMapPost: FC = () => {
  return (
    <div className="post-wrapper">
      <CommonUserHeading postUser={null as any} onPostUpdated={() => {}} onPostDeleted={() => {}} isShared={false} id="SufiyaElizaMapPost" />
      <div className="post-details ratio_55">
        <MapImage />
        <DetailBox heading={MapHeading} span={MapSpan} post={null as any} />
        <CommonLikePanel />
        <CommonPostReact post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} />
      </div>
    </div>
  );
};

export default SufiyaElizaMapPost;
