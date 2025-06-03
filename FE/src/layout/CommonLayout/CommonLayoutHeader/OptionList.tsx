import React, { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DarkLight from "./DarkLight";
import HeaderMessage from "./HeaderMessage";
import Notification from "./Notification";
import UserProfile from "./UserProfile";
import { useSocket, Notification as NotificationData, RecentMessage } from "@/hooks/useSocket";
import { NotificationType } from "@/layout/LayoutTypes";


const OptionList: FC = () => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [notificationList, setNotificationList] = useState<NotificationType[]>([]);
  const [unreadMessageUpdate, setUnreadMessageUpdate] = useState<RecentMessage | null>(null);
  const [isMessengerPage, setIsMessengerPage] = useState(false);

  const router = useRouter();
  useEffect(() => {
    const checkMessengerPage = () => {
      const pathname = window.location.pathname.toLowerCase();
      setIsMessengerPage(pathname.includes("messanger"));
    };
    const pathname = window.location.pathname.toLowerCase();

    checkMessengerPage();
    window.addEventListener("popstate", checkMessengerPage);
    return () => window.removeEventListener("popstate", checkMessengerPage);
  }, []);
  useSocket(
    (users) => {
      setOnlineUsers(users.map((user) => user.id));
    },
    (notificationData: NotificationData) => {
      // console.log(notificationData);
      setNotificationList((prev: NotificationType[]) => {
        if (
          prev.some(
            (notification: NotificationType) =>
              notification.id === notificationData.id
          )
        ) {
          return prev;
        }
        return [notificationData, ...prev];
      });
    }, 
    (unreadMessageUpdate: RecentMessage) => {
      setUnreadMessageUpdate(unreadMessageUpdate);
    }
  );
  // console.log("notificationList", notificationList);
  return (
    <ul className="option-list">
      {!isMessengerPage && <HeaderMessage unreadMessageUpdate={unreadMessageUpdate} onlineUsers={onlineUsers} />}
      <DarkLight />
      <Notification notificationList={notificationList} setNotificationList={setNotificationList}/>
      <UserProfile />
    </ul>
  );
};

export default OptionList;
