import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Button, Media } from "reactstrap";
import { ImagePath, MutualFriend, SendYouFriendRequest } from "../../../utils/constant";
import Image from "next/image";
import { NotificationListsProps, NotificationType } from "@/layout/LayoutTypes";
import { Dispatch, FC, SetStateAction } from "react";

interface FriendRequestProps {
  notification: NotificationType;  
  setShowNotification: Dispatch<SetStateAction<boolean>>;
}

const FriendRequest: FC<FriendRequestProps> = ({setShowNotification, notification}) => {
  return (
    <li className="d-block" onClick={() => setShowNotification(false)}>
      <div>
        <Media>
          <Image width={40} height={40} src={`${ImagePath}/user-sm/5.jpg`} alt="user"/>
          <Media body>
            <div>
              <h5 className="mt-0">
                <span>{notification.content}</span> {SendYouFriendRequest}
              </h5>
              <h6> 1 {MutualFriend}</h6>
              <div className="action-btns">
                <Button color="solid" onClick={() => setShowNotification(false)}>
                  <DynamicFeatherIcon iconName={"Check"} />
                </Button>
                <Button color="solid" className="ms-1" onClick={() => setShowNotification(false)}>
                  <DynamicFeatherIcon iconName={"X"} />
                </Button>
              </div>
            </div>
          </Media>
        </Media>
      </div>
    </li>
  );
};

export default FriendRequest;
