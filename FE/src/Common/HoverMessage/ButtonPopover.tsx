import { SvgPath } from "../../utils/constant";
import Image from "next/image";
import React from "react";

interface ButtonPopoverProps {
  onMessageClick?: () => void;
  onFriendRequestClick?: () => void;
}

const ButtonPopover: React.FC<ButtonPopoverProps> = ({ onMessageClick, onFriendRequestClick }) => {
  return (
    <div className="button-popover">
      <a className="btn btn-solid" onClick={onMessageClick}>
        <Image height={16} width={16} src={`${SvgPath}/message-square.svg`} className="img-fluid" alt="message-square"/>
        message
      </a>
      <a className="btn btn-solid" onClick={onFriendRequestClick}>
        <Image height={16} width={16} src={`${SvgPath}/user-check.svg`} className="img-fluid mr-0" alt="message-square"/>
      </a>
    </div>
  );
};

export default ButtonPopover;
