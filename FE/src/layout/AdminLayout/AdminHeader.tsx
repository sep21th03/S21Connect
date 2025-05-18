import { Container, Navbar, NavbarBrand } from "reactstrap";
import LeftHeader from "../CommonLayout/CommonLayoutHeader/LeftHeader";
import RightHeader from "../CommonLayout/CommonLayoutHeader/RightHeader";
import { CommonLayoutHeaderInterFace } from "@/layout/LayoutTypes";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { useState, useEffect } from "react";
import { UserStats } from "@/utils/interfaces/user";
import BrandLogo from "../CommonLayout/CommonLayoutHeader/BrandLogo";

const AdminHeader = () => {
  return (
    <header className={"d-none d-sm-block"}>
      <div className="mobile-fix-menu" />
      <Container fluid={true} className="custom-padding">
        <div className="header-section">
          <BrandLogo differentLogo={""} />
          <RightHeader total_posts={null} total_friends={null} />
        </div>
      </Container>
    </header>
  );
};

export default AdminHeader;
