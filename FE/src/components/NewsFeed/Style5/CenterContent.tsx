import CreatePost from "@/Common/CreatePost";
import React, { FC } from "react";
import { Col, Row } from "reactstrap";
import SufiyaElizaThirdPost from "../Style1/ContentCenter/SufiyaElizaThirdPost";
import GemixStore from "../Style3/ContentCenter/GemixStore";
import SufiyaElizaFirstPost from "../Style1/ContentCenter/SufiyaElizaFirstPost";
import SufiyaElizaMultiplePost from "../Style3/ContentCenter/SufiyaElizaMultiplePost";
import SufiyaElizaSecondPost from "../Style1/ContentCenter/SufiyaElizaSecondPost";
import SufiyaElizaMapPost from "./SufiyaElizaMapPost";

const CenterContent: FC = () => {
  return (
    <div className="content-center content-full">
      <Row>
        <Col xl="6">
          <CreatePost onPostCreated={() => {}} />
          <div className="overlay-bg" />
          <div className="post-panel section-t-space">
            <SufiyaElizaThirdPost fourthPost={29} post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
            <GemixStore />
            <SufiyaElizaThirdPost fourthPost={2} post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
          </div>
        </Col>
        <Col xl="6">
          <div className="post-panel">
            <SufiyaElizaMapPost />
            <SufiyaElizaFirstPost post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} className="section-t-space" />
            <SufiyaElizaMultiplePost post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
            <SufiyaElizaSecondPost post={null as any} shouldOpenComments={false} highlightCommentId={null} highlightReplyId={null} isShared={false} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CenterContent;
