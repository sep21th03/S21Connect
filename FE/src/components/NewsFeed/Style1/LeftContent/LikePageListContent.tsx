import { likePageListContentData } from "@/Data/NewsFeed";
import { ImagePath } from "../../../../utils/constant";
import { FC, useState } from "react";
import { Media } from "reactstrap";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { LikePageInterFace } from "../Style1Types";
import { useRouter } from "next/navigation";

const LikePageListContent: FC<{ pageFollows: any[] }> = ({ pageFollows }) => {
  const router = useRouter();
  const [listContent, setListContent] = useState(likePageListContentData);
  const handleActiveStar = (data: LikePageInterFace) => {
    if (data.active) {
      const withOutActiveTempData = likePageListContentData.map((item) =>
        item.member === data.member ? { ...item, active: false } : item
      );
      setListContent(withOutActiveTempData);
    } else {
      const withActiveTempData = likePageListContentData.map((item) =>
        item.member === data.member ? { ...item, active: true } : item
      );
      setListContent(withActiveTempData);
    }
  };

  const typeMap: Record<string, string> = {
    community: "Cộng đồng",
    brand: "Thương hiệu",
    public_figure: "Người của công chúng",
    business: "Doanh nghiệp",
    entertainment: "Giải trí",
    personal: "Cá nhân",
    other: "Khác",
  };

  return (
    <div className="list-content">
      <ul>
        {pageFollows?.map((data, index) => (
          <li key={index} onClick={() => router.push(`/favourite/home/${data.slug}`)}>
            <Media>
              <div
                className="img-part bg-size blur-up lazyloaded"
                style={{
                  backgroundImage: `url("${data.avatar}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                  display: "block",
                }}
              />
              <Media body>
                <h4>{data.name}</h4>
                <h6>
                  Trang {typeMap[data.type]}
                  <span>
                    <DynamicFeatherIcon
                      iconName="User"
                      className="icon-font-color iw-13 ih-13"
                    />
                    {data.followers_count}k
                  </span>
                </h6>
              </Media>
            </Media>
            {/* <div
              className={`favorite-btn ${data.active ? "active" : ""} `}
              onClick={() => handleActiveStar(data)}
            >
              <DynamicFeatherIcon
                iconName="Star"
                className="icon-dark iw-14 ih-14"
              />
            </div> */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LikePageListContent;
