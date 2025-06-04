import { Container } from "reactstrap";
import AboutUser from "../AboutUser";
import FriendSuggestion from "@/components/NewsFeed/Style1/LeftContent/FriendSuggestion";
import LikePage from "@/components/NewsFeed/Style1/LeftContent/LikePage";
import CreatePost from "@/Common/CreatePost";
import SufiyaElizaFirstPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaFirstPost";
import SufiyaElizaMultiplePost from "@/components/NewsFeed/Style3/ContentCenter/SufiyaElizaMultiplePost";
import SufiyaElizaSecondPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaSecondPost";
import SufiyaElizaThirdPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaThirdPost";
import CollegeMeetCard from "../CollegeMeetCard";
import Gallery from "@/components/NewsFeed/Style1/ContentRight/Gallery";
import ActivityFeeds from "../ActivityFeeds";
import EventsCard from "@/components/NewsFeed/Style1/ContentRight/EventsCard";
import WorldWideTrend from "../WorldWideTrend";

const TimeLineTabContent: React.FC = () => {
  return (
    <Container fluid>
      <div className="page-content">
        <div className="content-left">
          <AboutUser userProfile={null as any} isOwnProfile={false} />
          <FriendSuggestion mainClassName="d-xl-block d-none" />
          <div className="sticky-top d-xl-block d-none">
            <LikePage />
          </div>
        </div>
        <div className="content-center">
            <CreatePost onPostCreated={() => {}} />
            <div className="overlay-bg" />
            <div className="post-panel infinite-loader-sec section-t-space">
              <SufiyaElizaFirstPost post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
              <SufiyaElizaMultiplePost post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
              <SufiyaElizaSecondPost post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
              <SufiyaElizaThirdPost post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
              <SufiyaElizaSecondPost post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
              <SufiyaElizaSecondPost post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
            </div>
        </div>
        <div className="content-right d-xl-block d-none">
            <CollegeMeetCard />
            <Gallery />
            <ActivityFeeds username={null as any} />
            <div className="sticky-top">
              <EventsCard eventImage={12} diffrentPath="post" />
              <WorldWideTrend />
            </div>
          </div>
      </div>
    </Container>
  );
};

export default TimeLineTabContent;
