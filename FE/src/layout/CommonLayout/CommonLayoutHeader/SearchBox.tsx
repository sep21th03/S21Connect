import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Input } from "reactstrap";
import { RecentSearch } from "../../../utils/constant";
import FriendList from "./FriendList";
import useOutsideDropdown from "@/utils/useOutsideDropdown";
import { useEffect, useState } from "react";
import { User } from "@/utils/interfaces/user";
import { searchFriends } from "@/service/userSerivice";

const SearchBox: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [friendSuggestions, setFriendSuggestions] = useState<User[]>([]);
  const { isComponentVisible, ref, setIsComponentVisible } =
    useOutsideDropdown(false);

  useEffect(() => {
    if (keyword.trim().length === 0) {
      setFriendSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      searchFriends(keyword).then(setFriendSuggestions);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [keyword]);

  return (
    <div ref={ref} className={`search-box ${isComponentVisible ? "show" : ""}`}>
      <DynamicFeatherIcon iconName="Search" className="icon iw-16 icon-light" />
      <Input
        type="text"
        className="search-type"
        placeholder="Tìm bạn bè..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onClick={() => setIsComponentVisible(true)}
      />
      <div className="icon-close">
        <DynamicFeatherIcon
          iconName="X"
          className="iw-16 icon-light"
          onClick={() => setIsComponentVisible(false)}
        />
      </div>
      <div className="search-suggestion text-center">
        {friendSuggestions.length > 0 ? (
          <FriendList friends={friendSuggestions} />
        ) : (
          <span className="p-3">Không tìm thấy bạn bè</span>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
