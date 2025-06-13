//layout/SearchLayout/SearchPage/index.tsx
"use client";

import SearchSidebar from "@/layout/SearchLayout/SearchPage/SearchSidebar";
import { Container } from "reactstrap";
import SearchHeader from "@/layout/SearchLayout/SearchPage/SearchHeader";

interface SearchLayoutProps {
  children: React.ReactNode;
  activeTab: "all" | "users" | "posts" | "pages";
  onTabChange: (tab: "all" | "users" | "posts" | "pages") => void;
  filters: {
    userType: string;
    dateRange: string;
    postAuthor: string;
    customDateStart: string;
    customDateEnd: string;
  };
  onFilterChange: (filters: any) => void;
  searchData: {
    users: any[];
    posts: any[];
    pages: any[];
    friends: any[];
    friendsOfFriends: any[];
    strangers: any[];
  };
}

const SearchLayout = ({
  children,
  activeTab,
  onTabChange,
  filters,
  onFilterChange,
  searchData,
}: SearchLayoutProps) => {
  return (
    <div className="search-page">
      <SearchHeader />
      <Container fluid style={{ paddingTop: "100px" }}>
        <div className="row">
          <div className="col-lg-3 d-none d-lg-block" key="sidebar">
            <SearchSidebar
              activeTab={activeTab}
              onTabChange={onTabChange}
              filters={filters}
              onFilterChange={onFilterChange}
              searchData={searchData}
            />
          </div>
          <div className="col-lg-9 col-12">
            <main className="p-4">{children}</main>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SearchLayout;