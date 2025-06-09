import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import {
  Followers,
  Following,
  Friends,
  ImagePath,
  Likes,
  ViewProfile,
} from "../../utils/constant";
import { Container, Input, Spinner } from "reactstrap";
import FriendSDropDown from "./FriendSDropDown";
import CustomImage from "@/Common/CustomImage";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useProfileContext } from "@/contexts/ProfileContext";
import { getListFriendsByUsername } from "@/service/userSerivice";
import { UserAbout } from "@/utils/interfaces/user";

const FriendListBox: React.FC = () => {
  const [friends, setFriends] = useState<UserAbout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFriends, setFilteredFriends] = useState<string>("");
  const { userProfile, isOwnProfile } = useProfileContext();
  useEffect(() => {
    if(isOwnProfile === undefined) return;
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
    <div className="friend-list-box section-b-space">
      <div className="card-title">
        <h3>{Friends}</h3>
        <div className="right-setting">
          <div className="search-input input-style icon-right">
            <DynamicFeatherIcon
              iconName="Search"
              className="icon-dark icon iw-16"
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
        <div className="friend-list friend-page-list">
          <ul>
            {isLoading ? (
              <div className="text-center w-100">
                <Spinner />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center">Không có bạn bè</div>
            ) : (
              friends.map((data) => (
                <li key={data.id}>
                  <div className="profile-box friend-box">
                    <div className="profile-content">
                      <div className="image-section">
                        <div className="profile-img">
                          <div className="bg-size blur-up lazyloaded">
                            <CustomImage
                              src={data.avatar}
                              className="img-fluid blur-up lazyload bg-img"
                              alt="profile"
                            />
                          </div>
                          <span className="stats">
                            <Image
                              src={`${ImagePath}/icon/verified.png`}
                              width={15}
                              height={15}
                              className="img-fluid blur-up lazyloaded"
                              alt="verified"
                            />
                          </span>
                        </div>
                      </div>
                      <div className="profile-detail">
                        <Link href={`/profile/timeline/${data.username}`}>
                          <h2>
                            {data.first_name} {data.last_name}
                          </h2>
                        </Link>
                        <h5>@{data.username}</h5>
                        <div className="counter-stats">
                          <ul>
                            <li>
                              <h3 className="counter-value">
                                {data.user_data?.following}
                              </h3>
                              <h5>{Following}</h5>
                            </li>
                            <li>
                              <h3 className="counter-value">
                                {data.user_data?.friends}
                              </h3>
                              <h5>{Friends}</h5>
                            </li>
                            <li>
                              <h3 className="counter-value">
                                {data.user_data?.followers}
                              </h3>
                              <h5>{Followers}</h5>
                            </li>
                          </ul>
                        </div>
                        <Link
                          href={`/profile/timeline/${data.username}`}
                          className="btn btn-outline"
                        >
                          {ViewProfile}
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </Container>
    </div>
  );
};

export default FriendListBox;
