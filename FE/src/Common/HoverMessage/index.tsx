// HoverMessage.tsx
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
    avatar?: string;
    mutualFriends?: number;
    location?: string;
    email?: string;
    status?: string;
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
  
  const fullName = data.first_name && data.last_name 
    ? `${data.first_name} ${data.last_name}`
    : data.email || "User";
    
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
            <h6>
              <Image 
                height={15} 
                width={15} 
                src={`${SvgPath}/users.svg`} 
                className="img-fluid" 
                alt="mutual friends" 
              />
              {data.mutualFriends || 0} bạn chung
            </h6>
            <h6>
              <Image 
                height={15} 
                width={15} 
                src={`${SvgPath}/map-pin.svg`} 
                className="img-fluid" 
                alt="location" 
              />
              {data.location || "Không có thông tin"}
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
        <ButtonPopover />
      </PopoverBody>
    </UncontrolledPopover>
  );
};

export default HoverMessage;