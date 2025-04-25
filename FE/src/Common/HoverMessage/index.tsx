import { FC } from "react";
import { UncontrolledPopover, PopoverBody, Media } from "reactstrap";
import Image from "next/image";
import ButtonPopover from "./ButtonPopover";
import { ImagePath, SvgPath } from "../../utils/constant";

interface HoverMessageProps {
  data: {
    id?: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    avatar?: string;
    mutual_friends_count?: number;
    status?: string;
    email?: string;
    location?: string;
  };
  target: string;
  placement: "right" | "top" | "bottom" | "left";
  imagePath: string;
}

const HoverMessage: FC<HoverMessageProps> = ({ data, target, placement, imagePath }) => {
  // Suppress ReactStrap deprecated warnings
  const error = console.error;
  console.error = (...args: any) => {
    if (/defaultProps/.test(args[0])) return;
    error(...args);
  };

  if (!data) return null;
  
  // Xử lý tên đầy đủ từ các nguồn khác nhau
  const fullName = data.name || 
    (data.first_name && data.last_name 
      ? `${data.first_name} ${data.last_name}`
      : data.email || "User");
  
  // Tính thời gian hoạt động cuối
  const lastActive = data.lastActive ? new Date(data.lastActive) : null;
  const getLastActiveText = () => {
    if (!lastActive) return "";
    
    const now = new Date();
    const diffMs = now.getTime() - lastActive.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "vừa hoạt động";
    if (diffMins < 60) return `${diffMins} phút trước`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };
  
  const lastActiveText = data.status === "online" ? "Đang hoạt động" : getLastActiveText();
    
  return (
    <UncontrolledPopover 
      trigger="hover" 
      placement={placement} 
      target={target} 
      className="user-hover-card"
    >
      <PopoverBody>
        <Media className="popover-media">
          <div className="user-image-wrapper">
            <Image 
              height={60} 
              width={60} 
              className="img-fluid user-img" 
              src={`${ImagePath}/${imagePath}`} 
              alt={fullName} 
            />
            <span className={`status-indicator ${data.status || "offline"}`} />
          </div>
          <Media body>
            <h4>{fullName}</h4>
            {lastActiveText && (
              <h6 className="last-active">
                <Image 
                  height={15} 
                  width={15} 
                  src={`${SvgPath}/clock.svg`} 
                  className="img-fluid" 
                  alt="last active" 
                />
                {lastActiveText}
              </h6>
            )}
            <h6>
              <Image 
                height={15} 
                width={15} 
                src={`${SvgPath}/users.svg`} 
                className="img-fluid" 
                alt="mutual friends" 
              />
              {data.mutual_friends_count || 0} bạn chung
            </h6>
            {data.location && (
              <h6>
                <Image 
                  height={15} 
                  width={15} 
                  src={`${SvgPath}/map-pin.svg`} 
                  className="img-fluid" 
                  alt="location" 
                />
                {data.location}
              </h6>
            )}
            {data.email && (
              <h6>
                <Image 
                  height={15} 
                  width={15} 
                  src={`${SvgPath}/mail.svg`} 
                  className="img-fluid" 
                  alt="email" 
                />
                {data.email}
              </h6>
            )}
          </Media>
        </Media>
        <ButtonPopover />
      </PopoverBody>
    </UncontrolledPopover>
  );
};

export default HoverMessage;