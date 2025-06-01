import { FC, useEffect, useState } from "react";
import { CommonChatBoxInterFace, SingleUser } from "../MessengerType";
import { ImagePath } from "../../../utils/constant";
import CustomImage from "@/Common/CustomImage";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import SvgIconCommon from "@/Common/SvgIconCommon";
import UserGallery from "./UserGallery";
import UserChat from "./UserChat";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatTime } from "@/utils/formatTime";

const CommonChatBox: FC<CommonChatBoxInterFace> = ({
  userList,
  setUserList,
  setActiveTab,
  onlineUsers,
  initialConversationId,
}) => {
  const socialMedias = [
    { link: "https://www.facebook.com/", name: "facebook" },
    { link: "https://twitter.com/", name: "twitter" },
    { link: "https://www.whatsapp.com/", name: "whatsapp" },
  ];
  // const [first, setfirst] = useState<string | null>(null);

  // useEffect(() => {
  //   if (userList !== null && userList !== undefined) {
  //     const userId = userList.id;
  //     setfirst(userId);
  //   }
  // }, [userList, first, setfirst]);

  const router = useRouter();
  return (
    <div className="tab-box">
      <UserChat
        user={userList}
        setUserList={setUserList}
        setActiveTab={setActiveTab}
        onlineUsers={onlineUsers}
        initialConversationId={initialConversationId}
      />
      <div className="user-info">
        <div
          className="back-btn d-lg-none d-block"
          onClick={() => router.push("/")}
        >
          <DynamicFeatherIcon iconName="X" className="icon-theme" />
        </div>
        <div className="user-image bg-size blur-up lazyloaded text-center">
          <Image
            src={userList?.other_user?.avatar || `${ImagePath}/icon/user.png`}
            className="img-fluid lazyload bg-img rounded-circle"
            alt=""
            width={120}
            height={120}
          />
        </div>
        <div className="user-name">
          <h5>{userList?.other_user?.name}</h5>
          {/* <h6>{userList?.other_user?.last_active ? formatTime(userList?.other_user?.last_active) : ''}</h6> */}
          {/* <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora
            possimus magnam adipisci aspernatur.
          </p> */}
          <div className="social-btn" style={{ marginTop: "20px" }}>
            <ul>
              {socialMedias.map((data, index) => (
                <li className={data.name} key={index}>
                  <a href={data.link} target="_blank">
                    <SvgIconCommon iconName={data.name} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <UserGallery conversationId={initialConversationId || ""} />
      </div>
    </div>
  );
};

export default CommonChatBox;
