import { notificationList } from "@/Data/Layout";
import { Href, ImagePath } from "../../../utils/constant/index";
import { Media } from "reactstrap";
import Image from "next/image";
import { NotificationListsProps } from "@/layout/LayoutTypes";
import { FC } from "react";
import { formatTimeAgo } from "@/utils/formatTime";



const NotificationLists: FC<NotificationListsProps> = ({setShowNotification, notification}) => {
  return (
    <>
      {notification.map((data, index) => (
        <li key={index} onClick={() => setShowNotification(false)} style={!data.is_read ? {background: "rgb(237 247 251)"} : {}}>
          <a href={Href}>
            <Media>
              <Image src={data?.from_user?.avatar ? data?.from_user?.avatar : `${ImagePath}/user-sm/default.jpg`} alt="user" width={40} height={40}/>
              <Media body>
                <div>
                  <h5 className="mt-0">
                    <span>{data?.from_user?.name}</span>{data?.content}
                  </h5>
                  <h6>{formatTimeAgo(data?.created_at)}</h6>
                </div>
              </Media>
            </Media>
          </a>
        </li>
      ))}
    </>
  );
};

export default NotificationLists;
