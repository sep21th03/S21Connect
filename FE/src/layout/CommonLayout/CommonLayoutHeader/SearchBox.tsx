import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Input } from "reactstrap";
import { RecentSearch } from "../../../utils/constant";
import FriendList from "./FriendList";
import PageList from "./PageList";
import useOutsideDropdown from "@/utils/useOutsideDropdown";
import { useEffect, useState } from "react";
import { searchService, SearchPage, SearchUser } from "@/service/searchService";
import { useRouter } from "next/navigation";

const SearchBox: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [friendSuggestions, setFriendSuggestions] = useState<SearchUser[]>([]);
  const [pageSuggestions, setPageSuggestions] = useState<SearchPage[]>([]);
  const [recentHistories, setRecentHistories] = useState<
    {
      id: string;
      type: "user" | "page";
      name: string;
      username?: string;
      slug?: string;
      avatar?: string | null;
    }[]
  >([]);
  const { isComponentVisible, ref, setIsComponentVisible } =
    useOutsideDropdown(false);

  const router = useRouter();

  useEffect(() => {
    if (isComponentVisible && keyword.trim() === "") {
      searchService.searchHistory().then((res) => {
        const mapped = (res || [])
          .map((item: any) => {
            if (item?.type === "user") {
              return {
                id: item?.id,
                type: "user",
                name: item?.name,
                username: item?.username,
                avatar: item?.avatar || null,
              };
            } else if (item?.type === "page") {
              return {
                id: item?.id,
                type: "page",
                name: item?.name,
                slug: item?.slug,
                avatar: item?.avatar || null,
              };
            }
            return null;
          })
          .filter(Boolean);

        setRecentHistories(mapped);
      });
    }
  }, [isComponentVisible, keyword]);

  useEffect(() => {
    if (keyword.trim().length === 0) {
      setFriendSuggestions([]);
      setPageSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      searchService.searchAll(keyword).then((res) => {
        setFriendSuggestions(res.users || []);
        setPageSuggestions(res.pages || []);
      });
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [keyword]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keyword.trim()) {
      searchService.saveHistory("none", "", keyword.trim());
      
      router.push(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
      
      setIsComponentVisible(false);
    }
  };

  const handleSearchSubmit = () => {
    if (keyword.trim()) {
      searchService.saveHistory("none", "", keyword.trim());
      
      router.push(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
      
      setIsComponentVisible(false);
    }
  };

  return (
    <div ref={ref} className={`search-box ${isComponentVisible ? "show" : ""}`}>
      <DynamicFeatherIcon 
        iconName="Search" 
        className="icon iw-16 icon-light cursor-pointer" 
        onClick={handleSearchSubmit}
      />
      <Input
        type="text"
        className="search-type"
        placeholder="Tìm bạn bè..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onClick={() => setIsComponentVisible(true)}
        onKeyPress={handleKeyPress}
      />
      <div className="icon-close">
        <DynamicFeatherIcon
          iconName="X"
          className="iw-16 icon-light"
          onClick={() => setIsComponentVisible(false)}
        />
      </div>
      {isComponentVisible &&
        (friendSuggestions.length > 0 ||
          pageSuggestions.length > 0 ||
          (recentHistories.length > 0 && keyword.trim() === "")) && (
          <div className="search-suggestion text-start p-2">
            {friendSuggestions.length > 0 && (
              <>
                <h6 className="text-muted px-2">Bạn bè</h6>
                <FriendList
                  friends={friendSuggestions}
                  onClickItem={(friend) => {
                    searchService.saveHistory("user", friend.id, keyword);
                    router.push(`/profile/timeline/${friend.username}`);
                  }}
                />
              </>
            )}

            {pageSuggestions.length > 0 && (
              <>
                <h6 className="text-muted mt-3 px-2">Trang</h6>
                <PageList
                  pages={pageSuggestions}
                  onClickItem={(page) => {
                    searchService.saveHistory("page", page.id, keyword);
                    router.push(`/favourite/home/${page.slug}`);
                  }}
                />
              </>
            )}
            {recentHistories.length > 0 && keyword.trim() === "" && (
              <>
                <h6 className="text-center px-2">Tìm kiếm gần đây</h6>

                {recentHistories.filter((item) => item.type === "user").length >
                  0 && (
                  <>
                    <h6 className="text-muted px-2">Bạn bè</h6>
                    <FriendList
                      friends={recentHistories
                        .filter((item) => item.type === "user")
                        .map((item) => ({
                          id: item.id,
                          username: item.username || "",
                          name: item.name,
                          avatar: item.avatar || null,
                          type: "user",
                        }))}
                      onClickItem={(friend) => {
                        router.push(`/profile/timeline/${friend.username}`);
                      }}
                    />
                  </>
                )}

                {recentHistories.filter((item) => item.type === "page").length >
                  0 && (
                  <>
                    <h6 className="text-muted mt-3 px-2">Trang</h6>
                    <PageList
                      pages={recentHistories
                        .filter((item) => item.type === "page")
                        .map((item) => ({
                          id: item.id,
                          name: item.name,
                          slug: item.slug || "",
                          avatar: item.avatar || null,
                          type: "page",
                        }))}
                      onClickItem={(page) => {
                        router.push(`/favourite/home/${page.slug}`);
                      }}
                    />
                  </>
                )}
              </>
            )}

            {friendSuggestions.length === 0 &&
              pageSuggestions.length === 0 &&
              recentHistories.length === 0 && (
                <span className="p-3 d-block text-center">
                  Không tìm thấy kết quả
                </span>
              )}
          </div>
        )}
    </div>
  );
};

export default SearchBox;