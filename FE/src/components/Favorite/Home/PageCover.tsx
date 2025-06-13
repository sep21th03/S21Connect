import { FC, useEffect, useMemo, useState } from "react";
import CustomImage from "@/Common/CustomImage";
import { ImagePath, Href, Follow, SendMessage } from "../../../utils/constant";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import Image from "next/image";
import SocialButtons from "./SocialButtons";
import { Page } from "@/service/fanpageService";
import { usePageInfo } from "@/contexts/PageInfoContext";
import { useSelector } from "react-redux";
import { RootState } from "@/redux-toolkit/store";
import fanpageService from "@/service/fanpageService";

interface PageCoverProps {
  page: string;
}

const PageCover: FC<PageCoverProps> = ({ page }) => {
  const pageInfo = usePageInfo() as unknown as Page;
  const user = useSelector((state: RootState) => state.user.user);

  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loadingFollow, setLoadingFollow] = useState<boolean>(false);

  const socialDetails = [
    { number: pageInfo?.followers_count, detail: "Theo dõi" },
    { number: pageInfo?.posts_count, detail: "Bài viết" },
  ];

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!user || !pageInfo?.id) return;
      const result = await fanpageService.checkFollowStatus(pageInfo.id);
      setIsFollowing(result === true);
    };
    fetchFollowStatus();
  }, [pageInfo?.id, user]);

  const handleToggleFollow = async () => {
    if (!pageInfo?.id || loadingFollow) return;
    setLoadingFollow(true);
    try {
      if (isFollowing) {
        await fanpageService.unfollowPage(pageInfo.id);
        setIsFollowing(false);
      } else {
        await fanpageService.followPage(pageInfo.id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setLoadingFollow(false);
    }
  };

  const isOwnPage = useMemo(() => {
    if (!pageInfo?.admins || !user?.id) return false;
    return pageInfo.admins.some((admin) => admin.id === user.id);
  }, [pageInfo?.admins, user?.id]);

  if (!pageInfo) return null;

  return (
    <div className="page-cover">
      <div className="cover-img bg-size blur-up lazyloaded">
        <CustomImage
          src={`${pageInfo?.cover_image}`}
          className="img-fluid blur-up lazyload bg-img"
          alt="cover"
        />
        <div className="cover-btns">
          {!isOwnPage && (
            <a href={Href} className="btn btn-solid" onClick={handleToggleFollow}>
              {" "}
              <DynamicFeatherIcon
                iconName="UserPlus"
                className="iw-18 ih-18"
              />{" "}
              {isFollowing ? "Đã theo dõi" : Follow}
            </a>
          )}
          <a href={Href} className="btn btn-solid">
            <DynamicFeatherIcon
              iconName="MessageSquare"
              className="iw-18 ih-18"
            />
            {SendMessage}
          </a>
        </div>
      </div>
      <div className="cover-content">
        <div className="page-logo">
          <a href={Href} className="bg-size blur-up lazyloaded rounded-circle">
            <CustomImage
              src={`${pageInfo?.avatar}`}
              className="img-fluid blur-up lazyload bg-img"
              alt="image"
            />
          </a>
        </div>
        <a href={Href} className="page-name mt-3">
          <h4>{pageInfo?.name}</h4>
          <h6>@{pageInfo?.slug}</h6>
        </a>
        <div className="page-stats">
          <ul>
            {socialDetails.map((data, index) => (
              <li key={index}>
                <h2>{data.number}</h2>
                <h6>{data.detail}</h6>
              </li>
            ))}
            {/* <li>
              <h2>
                <Image width={32} height={19} src={`${ImagePath}/flag.jpg`} alt="image" className="img-fluid blur-up lazyloaded"/>
              </h2>
              <h6>usa</h6>
            </li> */}
          </ul>
        </div>
        <SocialButtons />
      </div>
    </div>
  );
};

export default PageCover;
