"use client";

import { Href, ImagePath, Domain } from "../../../utils/constant/index";
import { Media } from "reactstrap";
import Image from "next/image";
import { NotificationListsProps } from "@/layout/LayoutTypes";
import { FC } from "react";
import { formatTimeAgo } from "@/utils/formatTime";
import { useModalNavigation } from "@/hooks/useModalNavigation";


const NotificationLists: FC<NotificationListsProps> = ({setShowNotification, notification}) => {
  const { openModal } = useModalNavigation(); 
  const handleClick = (e: React.MouseEvent, data: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setShowNotification(false);
    
    const modalUrl = data.startsWith('/') ? data : `/${data}`;
    
    openModal(modalUrl);
  };
  return (
    <>
      {notification.map((data, index) => (
        <li key={index} onClick={(e) => handleClick(e, data.link || Href)} style={!data.is_read ? {background: "rgb(237 247 251)"} : {}}>
          <a href={Href}>
            <Media>
              <Image src={data?.from_user?.avatar ? data?.from_user?.avatar : `${ImagePath}/user-sm/default.jpg`} alt="user" width={40} height={40}/>
              <Media body>
                <div>
                  <h5 className="mt-0">
                    <span>{data?.from_user?.name}</span>{data?.content}
                  </h5>
                  <h6 style={{float: "right"}}>{formatTimeAgo(data?.created_at)}</h6>
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
