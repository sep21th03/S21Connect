"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getPost } from "@/service/postService";
import styles from "@/style/modal.module.css";
import { Spinner } from "reactstrap";
import SufiyaElizaFirstPost from "../NewsFeed/Style1/ContentCenter/SufiyaElizaFirstPost";
import SufiyaElizaThirdPost from "../NewsFeed/Style1/ContentCenter/SufiyaElizaThirdPost";
import SufiyaElizaMultiplePost from "../NewsFeed/Style3/ContentCenter/SufiyaElizaMultiplePost";
import SufiyaElizaSecondPost from "../NewsFeed/Style1/ContentCenter/SufiyaElizaSecondPost";

export default function PostModal({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const match = pathname.match(/^\/([^/]+)\/posts\/([^/?]+)/);
  const username = match?.[1] ?? null;
  const postId = match?.[2] ?? null;
  const commentId = searchParams.get("comment_id");
  const replyCommentId = searchParams.get("reply_comment_id");
  const reactionId = searchParams.get("reaction_id");
  const notificationId = searchParams.get("notification_id");

  const [post, setPost] = useState<any>(null);
  const [highlightCommentId, setHighlightCommentId] = useState<any>(null);
  const [highlightReplyId, setHighlightReplyId] = useState<any>(null);
  const [highlightReactionId, setHighlightReactionId] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldOpenComments, setShouldOpenComments] = useState(false);

  useEffect(() => {
    if (!postId || !username) return;
    setIsLoading(true);
    getPost(postId, commentId, replyCommentId, reactionId, notificationId)
      .then((data) => {
        setPost(data.post);
        setHighlightCommentId(data.highlight_comment_id);
        setHighlightReplyId(data.highlight_reply_comment_id);
        setHighlightReactionId(data.highlight_reaction_id);

        if (data.highlight_comment_id || data.highlight_reply_comment_id) {
            setShouldOpenComments(true);
          }
      })
      .catch((err) => {
        console.error("Failed to fetch post:", err);
      }).finally(() => {
        setIsLoading(false);
      });
  }, [postId, username, commentId, replyCommentId]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.setProperty("overflow", "hidden", "important");
    return () => {
      document.body.style.setProperty("overflow", "unset", "important");
    };
  }, []);
  const renderPostContent = () => {
    if (!post) return null;
    const postProps = {
        post,
        shouldOpenComments,
        highlightCommentId,
        highlightReplyId,
        highlightReactionId
      };
    switch (post.type) {
      case "first":
        return <SufiyaElizaFirstPost key={post.id} {...postProps} />;
      case "multiple":
        return <SufiyaElizaMultiplePost key={post.id} {...postProps} />;
      case "third":
        return <SufiyaElizaThirdPost key={post.id} {...postProps} />;
      case "second":
      default:
        return <SufiyaElizaSecondPost key={post.id} {...postProps} />;
    }
  };
  return (
    <div className={styles.modal} onClick={onClose}>
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Spinner />
        </div>
      ) : (
        <div
          className={styles.modalContent + " post-panel"}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white p-4 d-flex justify-between align-items-center">
            <h2 className="text-lg font-semibold">
              Bài viết của {post?.user.first_name} {post?.user.last_name}
            </h2>
            <button
              onClick={onClose}
              className={styles.buttonClose}
              aria-label="Đóng modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {renderPostContent()}
        </div>
      )}
    </div>
  );
}
