import { Href, ImagePath, Replay, Translate } from "../../utils/constant";
import { FC, useState } from "react";
import { Media } from "reactstrap";
import { Like } from "../../utils/constant/index";
import { MainCommentProps } from "../CommonInterFace";
import HoverMessage from "../HoverMessage";
import { formatTime } from "@/utils/formatTime";
import Image from "next/image";
import styles from "@/style/modal.module.css";

const MainComment: FC<MainCommentProps> = ({ comment, like,id, onReply, onReplyClick, replyText, setReplyText, isReplying, toggleReply,  isHighlighted = false }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const toggleLike = () => {
    if (liked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setLiked(!liked);
  };
  

  
  const handleSubmitReply = () => {
    if (replyText.trim()) {
      onReply(comment?.id, replyText);
      setReplyText('');
      toggleReply();
    }
  };

  
  return (
    <Media className={isHighlighted ? styles.highlightedComment : ''}>
      <a href={Href} className="user-img popover-cls bg-size blur-up lazyloaded" id={id} onClick={(e) => e.preventDefault()}>
        <img src={`${comment?.user?.avatar}`} className="img-fluid lazyload bg-img rounded-circle" alt="user" width={30} height={30}/>
      </a>
      <HoverMessage placement={"right"} target={id} name={comment?.user?.first_name + " " + comment?.user?.last_name} imagePath={`user-sm/2.jpg`} />
      <Media body>
        <a href={Href} onClick={(e) => e.preventDefault()}>
          <h5>{comment?.user?.first_name} {comment?.user?.last_name}</h5>
        </a>
        <p>{comment?.content}</p>
        <ul className="comment-option">
          <li><a 
              href={Href} 
              className={liked ? 'active' : ''} 
              onClick={(e) => { e.preventDefault(); toggleLike(); }}
            >
              {Like} {likesCount > 0 ? `(${likesCount})` : ""}
            </a></li>
            <li>
            <a href={Href} onClick={(e) => { e.preventDefault(); toggleReply(); }}>
              {Replay}
            </a>
          </li>
          <li>
            <a href={Href} onClick={(e) => e.preventDefault()}>
              {Translate}
            </a>
          </li>
        </ul>
        {isReplying && (
          <div className="reply-input mt-2 mb-3">
            <div className="d-flex">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSubmitReply();
                }}
              />
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleSubmitReply}
                disabled={!replyText.trim()}
              >
                Reply
              </button>
            </div>
          </div>
        )}
      </Media>
      <div className="comment-time">
        <h6>{formatTime(comment?.created_at)}</h6>
      </div>
    </Media>
  );
};

export default MainComment;
