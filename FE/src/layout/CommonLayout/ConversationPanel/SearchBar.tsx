import { FC, useState } from "react";
import { Input } from "reactstrap";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: FC<SearchBarProps> = ({ onSearch }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchToggle = () => {
    setSearchOpen(!searchOpen);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="search-bar">
      <div className="lg-search">
        <DynamicFeatherIcon
          iconName="Search"
          className="icon-theme icon iw-16"
          onClick={searchToggle}
        />
        <Input 
          type="text" 
          placeholder="find friends..." 
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      <div className={`xs-search ${searchOpen ? "open-full" : ""}`}>
        <div className="icon-search">
          <DynamicFeatherIcon
            iconName="Search"
            className="icon-dark iw-16"
            onClick={searchToggle}
          />
        </div>
        <div className="lg-search">
          <DynamicFeatherIcon
            iconName="Search"
            className="icon-dark icon iw-16"
            onClick={searchToggle}
          />
          <Input 
            type="text" 
            placeholder="find friends..." 
            value={searchQuery}
            onChange={handleSearch}
          />
          <div className="icon-close">
            <DynamicFeatherIcon
              iconName="X"
              className="icon-dark iw-16"
              onClick={searchToggle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;