"use client";
import React, { FC } from "react";
import CommonLayout from "../CommonLayout";
import PageCover from "@/components/Favorite/Home/PageCover";
import ProfileMenus from "@/components/Favorite/Home/ProfileMenus";
import { Container } from "reactstrap";
import { FavoriteLayoutProps } from "../LayoutTypes";
import { PageInfoProvider } from "@/contexts/PageInfoContext";

const FavoriteLayout: FC<FavoriteLayoutProps> = ({
  children,
  FavoriteTabs,
  loaderName,
  page,
}) => {
  return (
    <PageInfoProvider page={page}>
      <CommonLayout
        mainClass="favourite-page-body  custom-padding "
        loaderName={loaderName}
      >
        <div className="page-center">
          <PageCover page={page} />
          {FavoriteTabs ? FavoriteTabs : <ProfileMenus page={page} />}
          <Container fluid className="section-t-space px-0">
            {children}
          </Container>
        </div>
      </CommonLayout>
    </PageInfoProvider>
  );
};

export default FavoriteLayout;
