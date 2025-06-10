"use client";
import React, { FC, useState, useEffect } from "react";
import CommonLayout from "@/layout/CommonLayout";
import { Container } from "reactstrap";
import PageSidebar from "./PageSidebar";
import PageGrid from "./PageGrid";
import CreatePageModal from "./CreatePageModal";
import FanpageHeader from "./FanpageHeader";
import FanpageService from "@/service/fanpageService";
import { Page } from "@/components/Favorite/Fanpagetype";

const FanpageContent: FC = () => {
  const [activeTab, setActiveTab] = useState<
    "all" | "my_pages" | "liked" | "invitations"
  >("all");
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userHasPages, setUserHasPages] = useState(false);

  const loadPages = async (type: string) => {
    setLoading(true);
    const fetchedPages = await FanpageService.fetchPages(type);
    setPages(fetchedPages as unknown as Page[]);
    if (type === "my_pages") {
      setUserHasPages(fetchedPages.length > 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const [selectedPages, myPages] = await Promise.all([
        FanpageService.fetchPages(activeTab),
        activeTab !== "my_pages"
          ? FanpageService.fetchPages("my_pages")
          : Promise.resolve([]),
      ]);

      setPages(selectedPages as unknown as Page[]);
      if (activeTab === "my_pages") {
        setUserHasPages(selectedPages.length > 0);
      } else {
        setUserHasPages(myPages.length > 0);
      }
      setLoading(false);
    };

    setLoading(true);
    fetchData();
  }, [activeTab]);

  const handleTabChange = (tab: typeof activeTab) => setActiveTab(tab);
  const handleCreatePage = () => setShowCreateModal(true);
  const handlePageCreated = () => {
    setShowCreateModal(false);
    setUserHasPages(true);
    if (activeTab === "my_pages" || activeTab === "all") {
      loadPages(activeTab);
    }
  };

  return (
    <CommonLayout
      mainClass="fanpage-body custom-padding"
      loaderName="fanpagePage"
    >
      <div className="page-center">
        <FanpageHeader
          userHasPages={userHasPages}
          onCreatePage={handleCreatePage}
        />

        <Container fluid className="section-t-space px-0">
          <div className="page-content d-flex">
            <PageSidebar
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onCreatePage={handleCreatePage}
              userHasPages={userHasPages}
            />
            <div className="flex-grow-1">
              <PageGrid
                pages={pages}
                loading={loading}
                activeTab={activeTab}
                userHasPages={userHasPages}
                onRefresh={() => loadPages(activeTab)}
              />
            </div>
          </div>
        </Container>
      </div>

      {showCreateModal && (
        <CreatePageModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handlePageCreated}
        />
      )}
    </CommonLayout>
  );
};

export default FanpageContent;
