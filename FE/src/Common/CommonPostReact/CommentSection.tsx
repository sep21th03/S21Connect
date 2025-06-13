import React, {
  FC,
  useState,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import { Href } from "../../utils/constant";
import DynamicFeatherIcon from "../DynamicFeatherIcon";
import { Input } from "reactstrap";
import Picker, { EmojiClickData } from "emoji-picker-react";
import MainComment from "./MainComment";
import SubComment from "./SubComment";
import { LoadMoreReplies } from "../../utils/constant";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";

interface CommentSectionProps {
  showComment: boolean;
  postId: number;
  onCommentAdded?: () => void;
  highlightCommentId: number | null;
  highlightReplyId: number | null;
}

const CommentSection: FC<CommentSectionProps> = ({
  showComment,
  postId,
  onCommentAdded,
  highlightCommentId,
  highlightReplyId,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (showComment && postId) {
      fetchComments();
    }
  }, [showComment, postId]);

  function flattenRepliesTo2Levels(comments: any[]) {
    return comments.map((comment) => {
      const level1Replies: any[] = [];
  
      const processReplies = (replies: any[], parent: any) => {
        replies.forEach((reply) => {
          level1Replies.push({ ...reply, replies: [] });
  
          // Nếu reply có replies nữa (tức là cấp 3 trở lên), thì cũng thêm vào cấp 2 của cha ban đầu
          if (reply.replies && reply.replies.length > 0) {
            processReplies(reply.replies, comment); // luôn gắn vào cha gốc (comment cấp 1)
          }
        });
      };
  
      if (comment.replies && comment.replies.length > 0) {
        processReplies(comment.replies, comment);
      }
  
      return {
        ...comment,
        replies: level1Replies
      };
    });
  }
  

  const fetchComments = async () => {
    setLoading(true);
    try {
      const fetchedComments = await axiosInstance.get(
        API_ENDPOINTS.POSTS.COMMENTS.GET_COMMENTS(postId.toString())
      );
      const flattened = flattenRepliesTo2Levels(fetchedComments.data);
      setComments(flattened);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (comments.length > 0 && (highlightCommentId || highlightReplyId)) {
      setTimeout(() => {
        const elementId = highlightReplyId
          ? `reply-modal-${highlightReplyId}`
          : `comment-modal-${highlightCommentId}`;

        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          element.classList.add("highlighted-comment");

          setTimeout(() => {
            element.classList.remove("highlighted-comment");
          }, 3000);
        }
      }, 500);
    }
  }, [comments, highlightCommentId, highlightReplyId]);

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const addEmoji = (emoji: EmojiClickData) => {
    setMessageInput(messageInput + emoji.emoji);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessageInput(event.target.value);
  };

  const handleSubmitComment = async (
    event?: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event && event.key !== "Enter") return;
    if (!messageInput.trim()) return;

    setSubmitting(true);
    try {
      const newComment = await axiosInstance.post(
        API_ENDPOINTS.POSTS.COMMENTS.ADD,
        {
          id: postId,
          content: messageInput,
        }
      );
      console.log(newComment);
      setComments((prevComments) => [newComment.data.data, ...prevComments]);
      setMessageInput("");
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: number, content: string) => {
    try {
      const reply = await axiosInstance.post(API_ENDPOINTS.POSTS.COMMENTS.ADD, {
        id: postId,
        content: content,
        parent_id: parentId,
      });

      setComments((prevComments) =>
        prevComments.map((comment: any) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies
                ? [...comment.replies, reply.data.data]
                : [reply.data],
            };
          }
          return comment;
        })
      );

      // Reset reply state
      setActiveReplyId(null);
      setReplyText("");
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const handleReplyClick = (name: string, commentId: number) => {
    setActiveReplyId(commentId);
    setReplyText(`@${name} `);
  };

  const handleCancelReply = () => {
    setActiveReplyId(null);
    setReplyText("");
  };

  return (
    <div className="comment-section">
      <div className={`comments ${showComment ? "d-block" : ""}`}>
        {loading ? (
          <div className="text-center p-3">
            <DynamicFeatherIcon
              iconName="Loader"
              className="iw-30 ih-30 spinner"
            />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment: any) => (
            <div
              key={comment.id}
              className="main-comment"
              style={{ position: "relative" }}
            >
              {comment?.replies && comment?.replies?.length > 0 && (
                <div
                  className="comment-line"
                  style={{
                    position: "absolute",
                    left: "15px",
                    top: "30px",
                    bottom: "0",
                    width: "2px",
                    height: "calc(100% - 81px)",
                    backgroundColor: "#e0e0e0",
                  }}
                ></div>
              )}
              <MainComment
                id={
                  highlightCommentId &&
                  highlightCommentId === comment.id.toString()
                    ? `comment-modal-${comment.id}`
                    : `comment-${comment.id}`
                }
                comment={comment}
                onReply={handleReply}
                onReplyClick={handleReplyClick}
                onCancelReply={handleCancelReply}
                like={comment?.likes}
                replyText={replyText}
                setReplyText={setReplyText}
                isReplying={activeReplyId === comment.id}
                isHighlighted={Boolean(
                  highlightCommentId &&
                    highlightCommentId === comment.id.toString()
                )}
              />

              {comment.replies && comment.replies.length > 0 && (
                <div className="sub-comment">
                  {comment.replies.map((reply: any, index: number) => (
                    <div key={reply.id} style={{ position: "relative" }}>
                      <div
                        className="sub-comment-line"
                        style={{
                          position: "absolute",
                          left: "15px",
                          top: "15px",
                          width: "15px",
                          height: "2px",
                          backgroundColor: "#e0e0e0",
                        }}
                      />
                      <SubComment
                        id={`reply-${reply.id}`}
                        image={reply?.user?.avatar}
                        comment={reply}
                        onReplyClick={handleReplyClick}
                        onCancelReply={handleCancelReply}
                        onReply={handleReply}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        isReplying={activeReplyId === reply.id}
                        isHighlighted={Boolean(
                          highlightReplyId &&
                            highlightReplyId === reply.id.toString()
                        )}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-comments text-center p-3">
            <p>Không có bình luận nào. Hãy bình luận đầu tiên!</p>
          </div>
        )}
      </div>

      <div className="reply">
        <div className="search-input input-style input-lg icon-right">
          <Input
            type="text"
            className="emojiPicker"
            placeholder="Viết bình luận..."
            value={messageInput}
            onChange={handleInputChange}
            onKeyPress={handleSubmitComment}
            disabled={submitting}
            style={{
              textTransform: "none",
            }}
          />

          {showEmojiPicker && (
            <div className="emoji-picker-container">
              <Picker onEmojiClick={addEmoji} />
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
            }}
          >
            <DynamicFeatherIcon
              iconName="Camera"
              className="iw-14 ih-14 icon"
            />
          </a>

          <a
            href={Href}
            onClick={(e) => {
              e.preventDefault();
              handleSubmitComment();
            }}
          >
            <DynamicFeatherIcon iconName="Send" className="iw-14 ih-14 icon" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
