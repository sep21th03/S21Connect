import React, { useEffect, useState } from "react";
import { ActivityFeed } from "../../utils/constant";
import { Href } from "../../utils/constant/index";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import CommonDropDown from "@/Common/CommonDropDown";
import { activityFeedData } from "@/Data/profile";
import { Media, Spinner } from "reactstrap";
import { getActivityLogsByUsername } from "@/service/userSerivice";
import { formatTimeAgo } from "@/utils/formatTime";

interface ActivityFeedsProps {
  username: string;
}

const ActivityFeeds: React.FC<ActivityFeedsProps> = async ({ username }) => {
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!username) return;
    setLoading(true);
    getActivityLogsByUsername(username)
      .then((res) => setActivityLogs(res.data.data))
      .finally(() => setLoading(false));
  }, [username]);
  return (
    <div className="activity-list section-t-space">
      <div className="card-title">
        <h3>{ActivityFeed}</h3>
        <div className="settings">
          <div className="setting-btn">
            <a href={Href} className="d-flex">
              <DynamicFeatherIcon
                iconName="RotateCw"
                className="icon icon-theme stroke-width-3 iw-11 ih-11"
              />
            </a>
          </div>
          <div className="setting-btn setting-dropdown">
            <CommonDropDown
              mainClassName="icon-dark stroke-width-3 icon iw-11 ih-11"
              mainIcon="Sun"
              menuList={activityFeedData}
            />
          </div>
        </div>
      </div>
      <div className="activity-content">
        <ul>
          {activityLogs.map((data, index) =>
            loading ? (
              <Spinner />
            ) : (
              <li key={index}>
                <Media>
                  <div className="img-part bg-size blur-up lazyloaded">
                    <img
                      src={`${data.target_user?.avatar}`}
                      className="img-fluid lazyload bg-img rounded-circle"
                      alt=""
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // target.src = "/default-avatar.png";
                      }}
                    />
                  </div>
                  <Media body>
                    <h4>
                      {data.metadata?.content || "Không có nội dung"}{" "}
                      {data.action !== "created_post" && data.target_user && (
                        <span>
                          {data.target_user.first_name}{" "}
                          {data.target_user.last_name}
                        </span>
                      )}
                    </h4>
                    <h6>{formatTimeAgo(data.created_at)}</h6>
                  </Media>
                </Media>
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
};

export default ActivityFeeds;
