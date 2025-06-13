import { ImagePath, MutualFriend } from "../../../utils/constant";
import Image from "next/image";
import { Media } from "reactstrap";
import { Page } from "@/service/fanpageService";
import { SearchPage } from "@/service/searchService";

const PageList = ({ pages, onClickItem }: { pages: SearchPage[], onClickItem: (page: SearchPage) => void }) => {
  return (
    <ul className="friend-list" style={{ cursor: "pointer" }}>
      {pages.map((page, index) => (
        <li key={index} onClick={() => onClickItem(page)}>
          <Media>
            <Image width={40} height={40} src={page.avatar || ""} alt="user"/>
            <Media body>
              <div>
                <h5 className="mt-0">{page.name}</h5>
                {/* <h6> 1 {MutualFriend}</h6> */}
              </div>
            </Media>
          </Media>
        </li>
      ))}
    </ul>
  );
};

export default PageList;
