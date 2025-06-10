import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Friends, ImagePath, SeeAll } from "../../utils/constant";
import { Input, Container, Row, Media, Col, Spinner } from "reactstrap";
import CustomImage from "@/Common/CustomImage";
import { friendDropDownData, friendListData } from "@/Data/profile";
import CommonDropDown from "@/Common/CommonDropDown";
import Link from "next/link";
import FriendSDropDown from "./FriendSDropDown";
import { UserAbout } from "@/utils/interfaces/user";
import { useEffect, useState } from "react";
import { getListFriendsByUsername } from "@/service/userSerivice";
import { useProfileContext } from "@/contexts/ProfileContext";

const ProfileFriendList: React.FC = () => {
  const [friends, setFriends] = useState<UserAbout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFriends, setFilteredFriends] = useState<string>("");
  const { userProfile, isOwnProfile } = useProfileContext();
  useEffect(() => {
    if (isOwnProfile === undefined) return;
    if (filteredFriends === "" && typeof isOwnProfile === "boolean") {
      setFilteredFriends(isOwnProfile ? "all" : "mutual");
    }
  }, [isOwnProfile, filteredFriends]);
  useEffect(() => {
    if (!userProfile?.user?.username || !filteredFriends) return;

    const fetchFriends = async () => {
      setIsLoading(true);
      const friends = await getListFriendsByUsername(
        userProfile?.user?.username,
        filteredFriends,
        userProfile?.user?.id || ""
      );
      setFriends(friends);
      setIsLoading(false);
    };
    fetchFriends();
  }, [userProfile?.user?.username, userProfile?.user?.id, filteredFriends]);
  return (
    <div className="friend-list-box section-t-space section-b-space">
      <div className="card-title">
        <h3>{Friends}</h3>
        <div className="right-setting">
          <div className="search-input input-style icon-right">
            <DynamicFeatherIcon
              className="icon-dark icon iw-16"
              iconName="Search"
            />
            <Input
              type="text"
              placeholder="Tìm bạn bè..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <FriendSDropDown
            filteredFriends={filteredFriends}
            setFilteredFriends={setFilteredFriends}
            isOwnProfile={isOwnProfile}
          />
        </div>
      </div>
      <Container fluid>
        <Row className="friend-list ">
          {isLoading ? (
            <div className="text-center w-100">
              <Spinner />
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center">Không có bạn bè</div>
          ) : (
            friends
              .filter((friend) =>
                `${friend.first_name} ${friend.last_name}`
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              )
              .map((friend) => (
                <Col sm="6" key={friend.id}>
                  <div className="friend-box">
                    <Media>
                      <Link
                        href={`/profile/friend/${friend.username}`}
                        className="user-img bg-size blur-up lazyloaded"
                      >
                        <CustomImage
                          src={friend.avatar}
                          className="img-fluid blur-up lazyload bg-img"
                          alt="user"
                        />
                        <span className="available-stats" />
                      </Link>
                      <Media body>
                        <Link href={`/profile/friend/${friend.username}`}>
                          <h5 className="user-name">
                            {friend.first_name} {friend.last_name}
                          </h5>
                        </Link>
                        <h6>{friend.mutual_friends_count} bạn bè chung</h6>
                      </Media>
                    </Media>
                    <div className="setting-btn ms-auto setting-dropdown no-bg">
                      <CommonDropDown
                        mainClassName="icon icon-font-color iw-14"
                        mainIcon="MoreHorizontal"
                        menuList={friendDropDownData}
                      />
                    </div>
                  </div>
                </Col>
              ))
          )}
        </Row>
      </Container>
      <div className="see-all">
        <Link href={`/profile/friends/${userProfile?.user?.username}`} className="btn btn-solid">
          {SeeAll}
        </Link>
      </div>
    </div>
  );
};

export default ProfileFriendList;
