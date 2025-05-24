import {
  Confirm,
  Delete,
  Domain,
  ImagePath,
  MutualFriend,
} from "../../../utils/constant";
import Image from "next/image";
import { FC, useState, useEffect } from "react";
import { Button, Media, Spinner } from "reactstrap";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import Link from "next/link";

interface Friend {
  id: string;
  first_name: string;
  last_name: string;
  avatar: string;
  username: string;
  mutual_friend: number;
}

const DropdownContent: FC = () => {
  const [friendList, setFriendList] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchFriendList = async () => {
    setIsLoading(true);
    const response = await axiosInstance.get(
      API_ENDPOINTS.FRIENDS.FRIEND_REQUEST
    );
    setFriendList(response.data.data);
    setIsLoading(false);
  };
  useEffect(() => {
    fetchFriendList();
  }, []);
  const handleConfirm = async () => {
    setIsLoading(true);
    await axiosInstance.post(
      API_ENDPOINTS.FRIENDS.BASE +
        API_ENDPOINTS.FRIENDS.ACCEPT(friendList[0].id),
      {
        friend_id: friendList[0].id,
      }
    );
    setFriendList(friendList.filter((friend) => friend.id !== friendList[0].id));
    setIsLoading(false);
  };
  return (
    <div className="dropdown-content">
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center p-3">
          <Spinner />
        </div>
      ) : friendList.length === 0 ? (
        <div className="text-center p-3 text-muted">
          Không có lời mời kết bạn nào
        </div>
      ) : (
        <ul className="friend-list">
          {friendList.map((data, index) => (
            <li key={index}>
              <Media>
                <Link
                  href={`/profile/${data.username}`}
                  passHref
                  legacyBehavior
                >
                  <a style={{ display: "inline-flex", alignItems: "center" }}>
                    <Image
                      width={40}
                      height={40}
                      src={data.avatar}
                      alt="user"
                    />
                  </a>
                </Link>
                <Media body>
                  <div>
                    <Link
                      href={`/profile/${data.username}`}
                      passHref
                      legacyBehavior
                    >
                      <a>
                        <h5
                          className="mt-0"
                          style={{
                            maxWidth: "150px",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            display: "block",
                          }}
                        >
                          {data.first_name} {data.last_name}
                        </h5>
                      </a>
                    </Link>
                    <h6>
                      {" "}
                      {data.mutual_friend} {MutualFriend}
                    </h6>
                  </div>
                </Media>
              </Media>
              <div className="action-btns">
                <Button color="solid" onClick={handleConfirm}>
                  {Confirm}
                </Button>
                <Button outline className="ms-1">
                  {Delete}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownContent;
