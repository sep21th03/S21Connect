import { FC, useState } from "react";
import { Media, Input } from "reactstrap";
import { Href, ImagePath, Like, Replay, Translate } from "../../utils/constant";
import { SubCommentProps } from "../CommonInterFace";
import HoverMessage from "../HoverMessage";
import { formatTime } from "@/utils/formatTime";
import Image from "next/image";
import Picker, { EmojiClickData } from "emoji-picker-react";
import DynamicFeatherIcon from "../DynamicFeatherIcon";

const SubComment: FC<SubCommentProps> = ({
  image,
  id,
  comment,
  onReplyClick,
  onCancelReply,
  onReply,
  replyText,
  setReplyText,
  isReplying,
  isHighlighted = false,
}) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  const toggleLike = () => {
    if (liked) {
      setLikesCount((prev) => prev - 1);
    } else {
      setLikesCount((prev) => prev + 1);
    }
    setLiked(!liked);
  };

  const handleSubmitReply = async (
    event?: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event && event.key !== "Enter") return;
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      await onReply(comment?.id, replyText);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEmojiClick = (emojiObject: EmojiClickData) => {
    setReplyText(replyText + emojiObject.emoji);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <Media className="mb-4">
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
        data={comment?.user}
        imagePath={`${comment?.user?.avatar}`}
      />
      <Media body>
        <a href={Href} onClick={(e) => e.preventDefault()}>
          <h5>
            {comment.user.first_name} {comment.user.last_name}
          </h5>
        </a>
        <p>{comment.content}</p>
        <ul className="comment-option">
          <li>
            <a 
              href={Href}
              className={liked ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                toggleLike();
              }}
            >
              {Like} {likesCount > 0 ? `(${likesCount})` : ""}
            </a>
          </li>
          <li>
            <a
              href={Href}
              onClick={(e) => {
                e.preventDefault();
                if (isReplying) {
                  onCancelReply?.();
                } else {
                  onReplyClick(
                    `${comment?.user?.first_name} ${comment?.user?.last_name}`,
                    comment?.id
                  );
                }
              }}
            >
              {isReplying ? "Hủy" : Replay}
            </a>
          </li>
          <li>
            <a href={Href} onClick={(e) => e.preventDefault()}>
              {Translate}
            </a>
          </li>
        </ul>
        {isReplying && (
          <div className="reply mt-2 mb-3">
            <div className="search-input input-style input-lg icon-right">
              <Input
                type="text"
                className="emojiPicker"
                placeholder="Viết phản hồi..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={handleSubmitReply}
                disabled={submittingReply}
                style={{ textTransform: "none" }}
              />
              {showEmojiPicker && (
                <div className="emoji-picker-container">
                  <Picker onEmojiClick={handleEmojiClick} />
                </div>
              )}
              <a
                href={Href}
                onClick={(e) => {
                  e.preventDefault();
                  toggleEmojiPicker();
                }}
              >
                <DynamicFeatherIcon
                  iconName="Smile"
                  className="icon icon-2 iw-14 ih-14"
                />
              </a>
              <a
                href={Href}
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmitReply();
                }}
              >
                {submittingReply ? (
                  <DynamicFeatherIcon
                    iconName="Loader"
                    className="iw-14 ih-14 icon spinner"
                  />
                ) : (
                  <DynamicFeatherIcon
                    iconName="Send"
                    className="iw-14 ih-14 icon"
                  />
                )}
              </a>
            </div>
          </div>
        )}
      </Media>
      <div className="comment-time">
        <h6>{formatTime(comment.created_at)}</h6>
      </div>
    </Media>
  );
};

export default SubComment;