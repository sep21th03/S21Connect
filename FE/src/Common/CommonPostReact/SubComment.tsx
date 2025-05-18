import { FC, useState } from "react";
import { Media } from "reactstrap";
import { Href, ImagePath, Like, Replay, Translate } from "../../utils/constant";
import { SubCommentProps } from "../CommonInterFace";
import HoverMessage from "../HoverMessage";
import { formatTime } from "@/utils/formatTime";
import Image from "next/image";
const SubComment: FC<SubCommentProps> = ({ image, id, comment, onDelete, onReplyClick, isReplying, toggleReply, setIsReplying }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);

  const toggleLike = () => {
    if (liked) {
      setLikesCount((prev) => prev - 1);
    } else {
      setLikesCount((prev) => prev + 1);
    }
    setLiked(!liked);
  };

  return (
    <Media>
      <a
        href={Href}
        className="user-img popover-cls bg-size blur-up lazyloaded"
        id={id}
        onClick={(e) => e.preventDefault()}
      >
        <Image
          src={`${comment?.user.avatar}`}
          className="img-fluid lazyload bg-img rounded-circle"
          alt="user"
          width={30}
          height={30}
        />
      </a>
      <HoverMessage
        placement={"right"}
        target={id}
        name={comment?.user.first_name + " " + comment?.user.last_name}
        imagePath={`user-sm/${image}.jpg`}
      />
      <Media body>
        <a href={Href}>
          <h5>
            {comment.user.first_name} {comment.user.last_name}
          </h5>
        </a>
        <p>{comment.content}</p>
        <ul className="comment-option">
          <li>
            <a href={Href}>{Like}</a>
          </li>
          <li>
            <a
              href={Href}
              onClick={(e) => {
                e.preventDefault();
                onReplyClick(comment?.user?.first_name + " " + comment?.user?.last_name, comment?.id);
              }}
            >
              {Replay}
            </a>
          </li>
          <li>
            <a href={Href}>{Translate}</a>
          </li>
        </ul>
      </Media>
      <div className="comment-time">
        <h6>{formatTime(comment.created_at)}</h6>
      </div>
    </Media>
  );
};

export default SubComment;
