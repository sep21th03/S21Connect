import { friendSliderOption } from "@/Data/SliderOptions";
import { AddFriend, ImagePath } from "../../../../utils/constant";
import Image from "next/image";
import Link from "next/link"; 
import { FC, useState, useEffect } from "react";
import Slider from "react-slick";
import { toast } from "react-toastify"; 
import { Button } from "reactstrap"; 
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import FriendService from "@/service/friendService";
import { useSession } from "next-auth/react"; 

interface FriendSuggestionData {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string;
  is_verified: boolean;
  friendship_status?: "none" | "pending" | "accepted" | "rejected"; 
}

const FriendSuggestion: FC = () => {
  const { data: session } = useSession(); 
  const [friendSuggestions, setFriendSuggestions] = useState<FriendSuggestionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sendingRequest, setSendingRequest] = useState<{ [key: string]: boolean }>({}); 

  useEffect(() => {
    const fetchFriendSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.USERS.FRIEND_SUGGESTION);
        setFriendSuggestions(response.data); 
      } catch (error) {
        console.error("Error fetching friend suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendSuggestions();
  }, []);

  const handleSendFriendRequest = async (userId: string) => {
    if (!session?.user?.id) {
      toast.error("Vui lòng đăng nhập để gửi lời mời kết bạn.");
      return;
    }

    setSendingRequest((prev) => ({ ...prev, [userId]: true }));
    try {
      await FriendService.sendFriendRequest(userId);
      setFriendSuggestions((prev) =>
        prev.map((friend) =>
          friend.id === userId ? { ...friend, friendship_status: "pending" } : friend
        )
      );
      toast.success("Đã gửi lời mời kết bạn!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Không thể gửi lời mời kết bạn. Vui lòng thử lại.");
    } finally {
      setSendingRequest((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const renderActionButton = (friend: FriendSuggestionData) => {
    const isSending = sendingRequest[friend.id];
    switch (friend.friendship_status) {
      case "pending":
        return (
          <Button color="secondary" disabled size="sm">
            Đã gửi lời mời
          </Button>
        );
      case "accepted":
        return (
          <Button color="success" disabled size="sm">
            Bạn bè
          </Button>
        );
      case "rejected":
      case "none":
      default:
        return (
          <Button
            color="primary"
            onClick={() => handleSendFriendRequest(friend.id)}
            disabled={isSending}
            size="sm"
          >
            {isSending ? "Đang gửi..." : AddFriend}
          </Button>
        );
    }
  };

  return (
    <div className="post-wrapper col-grid-box section-t-space no-background d-block">
      <div className="post-details">
        <div className="img-wrapper">
          <div className="slider-section">
            {isLoading ? (
              <div className="text-center">Đang tải gợi ý bạn bè...</div>
            ) : friendSuggestions.length === 0 ? (
              <div className="text-center"></div>
            ) : (
              <Slider
                className="friend-slide ratio_landscape default-space no-arrow"
                {...friendSliderOption}
              >
                {friendSuggestions.map((data) => (
                  <div key={data.id}>
                    <div style={{ width: "100%", display: "inline-block" }}>
                      <div className="profile-box friend-box">
                        <div className="profile-content">
                          <div className="image-section">
                            <Link href={`/profile/timeline/${data.username}`}>
                              <div className="profile-img">
                                <div
                                  className="bg-size blur-up lazyloaded"
                                  style={{
                                    backgroundImage: `url(${data.avatar || `${ImagePath}/default-avatar.png`})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center center",
                                    backgroundRepeat: "no-repeat",
                                    display: "block",
                                  }}
                                />
                                {data.is_verified && (
                                  <span className="stats">
                                    <Image
                                      width={22}
                                      height={22}
                                      src={`${ImagePath}/icon/verified.png`}
                                      className="img-fluid blur-up lazyloaded"
                                      alt="verified"
                                    />
                                  </span>
                                )}
                              </div>
                            </Link>
                          </div>
                          <div className="profile-detail">
                            <Link href={`/profile/timeline/${data.username}`}>
                              <h2>
                                {data.first_name} {data.last_name}
                              </h2>
                            </Link>
                            {renderActionButton(data)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendSuggestion;