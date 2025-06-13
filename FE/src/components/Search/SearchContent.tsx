//components/Search/SearchContent.tsx
"use client";

import { Nav, NavItem, NavLink } from "reactstrap";
import AllResults from "@/components/Search/AllResults";
import UserResults from "@/components/Search/UserResults";
import { Spinner } from "reactstrap";
import PostResults from '@/components/Search/PostResults';
import PageResults from '@/components/Search/PageResults';

interface SearchContentProps {
  activeTab: "all" | "users" | "posts" | "pages";
  onTabChange: (tab: "all" | "users" | "posts" | "pages") => void;
  searchData: {
    users: any[];
    posts: any[];
    pages: any[];
    friends: any[];
    friendsOfFriends: any[];
    strangers: any[];
  };
  filters: {
    userType: string;
    dateRange: string;
    postAuthor: string;
    customDateStart: string;
    customDateEnd: string;
  };
  onFilterChange: (filters: any) => void;
  keyword: string;
  loading: boolean;
}

const SearchContent = ({
  activeTab,
  onTabChange,
  searchData,
  filters,
  onFilterChange,
  keyword,
  loading,
}: SearchContentProps) => {
  return (
    <div className="search-content">
      <div className="d-lg-none mb-4">
        <Nav pills className="search-tabs">
          <NavItem>
            <NavLink
              active={activeTab === "all"}
              onClick={() => onTabChange("all")}
              className="cursor-pointer"
            >
              Tất cả
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={activeTab === "users"}
              onClick={() => onTabChange("users")}
              className="cursor-pointer"
            >
              Mọi người ({searchData.users.length})
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={activeTab === "posts"}
              onClick={() => onTabChange("posts")}
              className="cursor-pointer"
            >
              Bài viết ({searchData.posts.length})
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={activeTab === "pages"}
              onClick={() => onTabChange("pages")}
              className="cursor-pointer"
            >
              Trang ({searchData.pages.length})
            </NavLink>
          </NavItem>
        </Nav>
      </div>

      <div className="search-header mb-4">
        <h4>Kết quả tìm kiếm cho "{keyword}"</h4>
        <p className="text-muted">
          Tìm thấy{" "}
          {searchData.users.length +
            searchData.posts.length +
            searchData.pages.length}{" "}
          kết quả
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : (
        <div className="search-results">
          {activeTab === "all" && (
            <AllResults
              searchData={searchData}
              keyword={keyword}
              onTabChange={onTabChange}
            />
          )}

          {activeTab === "users" && (
            <UserResults
              users={searchData.users}
              friends={searchData.friends}
              friendsOfFriends={searchData.friendsOfFriends}
              strangers={searchData.strangers}
              filters={filters}
              onFilterChange={onFilterChange}
            />
          )}

          {activeTab === 'posts' && (
            <PostResults 
              posts={searchData.posts}
              filters={filters}
              onFilterChange={onFilterChange}
            />
          )}
          
          {activeTab === 'pages' && (
            <PageResults 
              pages={searchData.pages}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SearchContent;
