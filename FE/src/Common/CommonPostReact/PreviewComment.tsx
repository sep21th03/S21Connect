import { Href, ImagePath, Replay, Translate } from "../../utils/constant";
import { FC, useState } from "react";
import { Media } from "reactstrap";
import { PreviewCommentProps } from "../CommonInterFace";
import HoverMessage from "../HoverMessage";
import { formatTime } from "@/utils/formatTime";
import styles from "@/style/modal.module.css";

const PreviewComment: FC<PreviewCommentProps> = ({ comment, like,id}) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);


  
  return (
    <Media className={styles.previewComment}>
      <a href={Href} className={styles.userImg} id={id} onClick={(e) => e.preventDefault()}>
        <img src={`${comment?.user?.avatar}`} className="img-fluid lazyload bg-img rounded-circle" alt="user" width={30} height={30}/>
      </a>
      <HoverMessage placement={"right"} target={id} name={comment?.user?.first_name + " " + comment?.user?.last_name} imagePath={comment?.user?.avatar} />
      <Media body>
        <a href={Href} onClick={(e) => e.preventDefault()}>
          <h5>{comment?.user?.first_name} {comment?.user?.last_name}</h5>
        </a>
        <p>{comment?.content}</p>
      </Media>
      <div className={styles.commentTime}>
        <h6>{formatTime(comment?.created_at)}</h6>
      </div>
    </Media>
  );
};

export default PreviewComment;
