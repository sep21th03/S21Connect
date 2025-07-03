import { FC } from "react";
import { About, Href } from "../../../../utils/constant/index";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { aboutContentData } from "@/Data/Favorite";
import Link from "next/link";
import { Page } from "@/service/fanpageService";

const AboutCard: FC<{ pageInfo: Page }> = ({ pageInfo }) => {
  const typeMap: Record<string, string> = {
    community: "Cộng đồng",
    brand: "Thương hiệu",
    public_figure: "Người của công chúng",
    business: "Doanh nghiệp",
    entertainment: "Giải trí",
    personal: "Cá nhân",
    other: "Khác",
  };
  const aboutContentData = [
    { heading: "Trang", detail: typeMap[pageInfo?.type || ""] },
    {
      heading: "email",
      detail: pageInfo?.email,
    },
    {
      heading: "phone",
      detail: pageInfo?.phone,
    },
  ];

  return (
    <div className="profile-about pages-about">
      <div className="card-title" style={{ paddingBottom: "0px" }}>
        <h3>{About}</h3>
        <div className="settings">
          <div className="setting-btn">
            <a href={Href}>
              <DynamicFeatherIcon
                iconName="RotateCw"
                className="icon icon-dark stroke-width-3 iw-11 ih-11"
              />
            </a>
          </div>
        </div>
      </div>
      <div className="about-content">
        <ul>
          <h3 className="text-center">{pageInfo?.description}</h3>
          {aboutContentData
            .filter(
              (data) =>
                data.detail !== null &&
                data.detail !== undefined &&
                data.detail !== ""
            )
            .map((data, index) => (
              <li key={index}>
                <div className="details">
                  <h4>{data.heading}</h4>
                  <h6>{data.detail}</h6>
                </div>
              </li>
            ))}
          {pageInfo?.link && (
            <li>
              <div className="details">
                <h4>website</h4>
                <h6>
                  <Link href={pageInfo.link}>{pageInfo.link}</Link>
                </h6>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AboutCard;
