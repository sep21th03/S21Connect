import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Close, NotificationHeader } from "../../../utils/constant";
import NotificationLists from "./NotificationLists";
import FriendRequest from "./FriendRequest";
import useOutsideDropdown from "@/utils/useOutsideDropdown";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import React, { useEffect, useState, memo } from "react";
import { NotificationType } from "@/layout/LayoutTypes";
import { useSocket, Notification as NotificationData } from "@/hooks/useSocket";
import { Spinner } from "reactstrap";

const Notification: React.FC<{
  notificationList: NotificationType[];
  setNotificationList: React.Dispatch<React.SetStateAction<NotificationType[]>>;
}> = ({ notificationList, setNotificationList }) => {
  const { isComponentVisible, ref, setIsComponentVisible } =
    useOutsideDropdown(false);
  const [shouldMarkRead, setShouldMarkRead] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);
  // const FriendRequestMemo = React.memo(FriendRequest);
  // const NotificationListsMemo = React.memo(NotificationLists);
  const [hasFetched, setHasFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isComponentVisible && !hasFetched) {
      const fetchNotificationList = async () => {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get(
            API_ENDPOINTS.NOTIFICATIONS.GET_NOTIFICATION_LIST
          );
          setNotificationList(response.data);
        } catch (error) {
          console.error("Lỗi khi lấy thông báo:", error);
          setNotificationList([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchNotificationList();
    }
    if (!isComponentVisible && wasOpen && shouldMarkRead) {
      const markAllAsRead = async () => {
        try {
          await axiosInstance.post(
            API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ
          );
          setNotificationList((prev: NotificationType[]): NotificationType[] =>
            prev.map((n) => ({ ...n, is_read: true }))
          );
        } catch (error) {
          console.error("Lỗi khi đánh dấu đã đọc:", error);
        }
      };
      markAllAsRead();
      setShouldMarkRead(false);
    }

    if (isComponentVisible && !wasOpen) {
      setShouldMarkRead(true);
    }
    setWasOpen(isComponentVisible);
  }, [isComponentVisible, hasFetched]);
  // console.log(notificationList);
  const unreadNotificationCount = notificationList.filter(
    (n) => !n.is_read
  ).length;

  return (
    <li className="header-btn custom-dropdown dropdown-lg btn-group notification-btn">
      <a className={`main-link ${isComponentVisible ? "show" : ""}`}>
        <DynamicFeatherIcon
          iconName="Bell"
          className="icon-light stroke-width-3 iw-16 ih-16"
          onClick={() => setIsComponentVisible(!isComponentVisible)}
        />
        {unreadNotificationCount > 0 && (
          <span className="count warning">{unreadNotificationCount}</span>
        )}
      </a>
      <div
        ref={ref}
        className={`dropdown-menu dropdown-menu-right ${
          isComponentVisible ? "show" : ""
        }`}
        onClick={(e) => {
          e.preventDefault();
          setIsComponentVisible(!isComponentVisible);
        }}
      >
        <div className="dropdown-header">
          <span>{NotificationHeader}</span>
          <div
            className="mobile-close"
            onClick={() => setIsComponentVisible(!isComponentVisible)}
          >
            <h5>{Close}</h5>
          </div>
        </div>
        {isComponentVisible && (
          <div className="dropdown-content text-center">
            {isLoading ? (
              <Spinner />
            ) : notificationList.length === 0 ? (
              <div className="no-notifications">Không có thông báo</div>
            ) : (
              <ul className="friend-list">
                {notificationList
                  .filter((n) => n.type === "friend_request")
                  .map((notification) => (
                    <FriendRequest
                      key={notification.id}
                      notification={notification}
                      setShowNotification={setIsComponentVisible}
                    />
                  ))}
                <NotificationLists
                  setShowNotification={setIsComponentVisible}
                  notification={notificationList.filter(
                    (n) => n.type !== "friend_request"
                  )}
                />
              </ul>
            )}
          </div>
        )}
      </div>
    </li>
  );
};

export default Notification;
