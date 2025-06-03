import { User } from "@/utils/interfaces/user";
import { ImagePath, MutualFriend } from "../../../utils/constant";
import Image from "next/image";
import { Media } from "reactstrap";

const FriendList = ({ friends }: { friends: User[] }) => {
  return (
    <ul className="friend-list">
      {friends.map((friend, index) => (
        <li key={index}>
          <Media>
            <Image width={40} height={40} src={friend.avatar || ""} alt="user"/>
            <Media body>
              <div>
                <h5 className="mt-0">{friend.first_name} {friend.last_name}</h5>
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
