"use client";
import React, { FC } from "react";
import { Col, Row } from "reactstrap";
import AboutCard from "../Home/ContentLeft/AboutCard";
import HobbiesAndInterest from "./HobbiesAndInterest";
import { usePageInfo } from "@/contexts/PageInfoContext";
import { Page } from "@/service/fanpageService";


const FavoriteAboutPageContent: FC<{ page: string }> = ({ page }) => {
  const pageInfo = usePageInfo();

  
  return (
    <Row>
      <Col xl="4">
        <div className="sticky-top">
          <AboutCard pageInfo={pageInfo as unknown as Page}/>
        </div>
      </Col>
      <Col xl="8">
        <HobbiesAndInterest pageInfo={pageInfo as unknown as Page}/>
      </Col>
    </Row>
  );
};

export default FavoriteAboutPageContent;
