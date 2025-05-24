import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { FC, useEffect, useState } from "react";
import { Dropdown, Media, DropdownToggle, DropdownMenu } from "reactstrap";
import { Href, ImagePath } from "../utils/constant/index";
import EditModalPostHeader from "@/Common/CreatePost/editModalPostHeader";
import { CommonUserHeadingProps } from "./CommonInterFace";
import HoverMessage from "./HoverMessage";
import Image from "next/image";
import { formatTimeAgo } from "@/utils/formatTime";
import { feelingMap } from "@/Data/common";
import { profile } from "console";
import { createPostDropDown } from "@/Data/common";
import { Post } from "@/components/NewsFeed/Style1/Style1Types";

const CommonUserHeading: FC<CommonUserHeadingProps> = ({
  id,
  postUser,
  onPostUpdated,
  onPostDeleted,
}) => {
  
  const [showOption, setShowOption] = useState(false);
  const matchedVisibility = createPostDropDown.find(
    (option) => option.slug === postUser?.visibility
  );
  return (
    <div className="post-title">
      <div className="profile">
        <Media>
          <a
            className="popover-cls user-img bg-size blur-up lazyloaded"
            href={Href}
            id={id}
          >
            <Image
              src={postUser?.user?.avatar}
              className="img-fluid lazyload bg-img rounded-circle"
              alt="user"
              width={55}
              height={55}
            />
          </a>
          <Media body>
            <h5>
              {postUser?.user?.first_name} {postUser?.user?.last_name}{" "}
              {postUser?.feeling && feelingMap[postUser.feeling] && (
                <>
                  <span style={{ textTransform: "none" }}>đang cảm thấy</span>{" "}
                  <img
                    src={feelingMap[postUser.feeling].emoji}
                    alt={postUser.feeling}
                    width={20}
                    height={20}
                    style={{ verticalAlign: "middle", margin: "0 4px" }}
                  />
                  {feelingMap[postUser.feeling].title}
                </>
              )}
              {postUser?.checkin && <> đang ở {postUser.checkin}</>}
              {postUser?.taggedFriends &&
                Array.isArray(postUser.taggedFriends) &&
                postUser.taggedFriends.length > 0 && (
                  <>
                    {" "}
                    cùng với{" "}
                    {postUser.taggedFriends.map(
                      (friend: any, index: number) => (
                        <span key={friend.id}>
                          <a href={`/${friend.username}`}>
                            {friend.first_name} {friend.last_name}
                          </a>
                          {index < postUser.taggedFriends.length - 1 && ", "}
                        </span>
                      )
                    )}
                  </>
                )}
            </h5>

            <h6 className="d-flex align-items-center gap-2">
              {formatTimeAgo(postUser?.created_at)}
              {matchedVisibility && (
                <span className="d-flex align-items-center gap-1">
                  <DynamicFeatherIcon
                    iconName={matchedVisibility.icon}
                    className="iw-14"
                  />
                  {matchedVisibility.name}
                </span>
              )}
            </h6>
          </Media>
        </Media>
        <HoverMessage
          placement={"right"}
          target={id}
          name={postUser?.user?.first_name + " " + postUser?.user?.last_name}
          imagePath={`${postUser?.user?.avatar}`}
        />
      </div>
      <div className="setting-btn ms-auto setting-dropdown no-bg">
        <Dropdown
          isOpen={showOption}
          toggle={() => setShowOption(!showOption)}
          className="custom-dropdown arrow-none dropdown-sm btn-group"
        >
          <DropdownToggle color="transparent">
            <div>
              <DynamicFeatherIcon
                iconName="MoreHorizontal"
                className="icon icon-font-color iw-14"
              />
            </div>
          </DropdownToggle>
          <EditModalPostHeader postUser={postUser} onPostUpdated={onPostUpdated}  onPostDeleted={onPostDeleted}/>
        </Dropdown>
      </div>
    </div>
  );
};

export default CommonUserHeading;
