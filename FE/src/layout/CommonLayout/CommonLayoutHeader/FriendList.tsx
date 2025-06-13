import { ImagePath, MutualFriend } from "../../../utils/constant";
import Image from "next/image";
import { Media } from "reactstrap";
import { SearchUser } from "@/service/searchService";

const FriendList = ({ friends, onClickItem }: { friends: SearchUser[], onClickItem: (friend: SearchUser) => void }) => {
  return (
    <ul className="friend-list" style={{ cursor: "pointer" }}>
      {friends.map((friend, index) => (
        <li key={index} onClick={() => onClickItem(friend)}>
          <Media>
            <Image width={40} height={40} src={friend.avatar || ""} alt="user"/>
            <Media body>
              <div>
                <h5 className="mt-0">{friend.name}</h5>
                {/* <h6> 1 {MutualFriend}</h6> */}
              </div>
            </Media>
          </Media>
        </li>
      ))}
    </ul>
  );
};

export default FriendList;
