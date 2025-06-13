import { FC, useState } from "react";
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
  onMessageClick?: () => void;
  onFriendRequestClick?: () => void;
}

const HoverMessage: FC<HoverMessageProps> = ({ 
  data, 
  target, 
  placement, 
  imagePath, 
  onMessageClick, 
  onFriendRequestClick 
}) => {
  const originalError = console.error;
  console.error = (...args: any) => {
    if (/defaultProps/.test(args[0])) return;
    originalError(...args);
  };

  if (!data) return null;
  
  const fullName = data.name || 
    (data.first_name && data.last_name 
      ? `${data.first_name} ${data.last_name}`
      : data.email || "User");
      

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(data);
  };
  return (
    <UncontrolledPopover 
      trigger="hover" 
      placement={placement} 
      target={target}
      className="user-hover-card"
    >
      <PopoverBody>
        <Media className="popover-media" onClick={handleClick}>
          <div className="user-image-wrapper">
            <Image 
              height={60} 
              width={60} 
              className="img-fluid user-img" 
              src={imagePath}
              alt={fullName} 
            />
            <span className={`status-indicator ${data.status || "offline"}`} />
          </div>
          <Media body>
            <h4>{fullName}</h4>
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
        <ButtonPopover onMessageClick={onMessageClick} onFriendRequestClick={onFriendRequestClick} />
      </PopoverBody>
    </UncontrolledPopover>
  );
};

export default HoverMessage;