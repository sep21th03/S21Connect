import { useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef, useEffect, useState } from "react";

export function useModalNavigation() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const previousUrlRef = useRef<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkModal = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hasModal = urlParams.get("modal") === "true";
      setIsModalOpen(hasModal);
    };

    checkModal();

    const handlePopState = () => {
      checkModal();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const hasModal = searchParams.get("modal") === "true";
    setIsModalOpen(hasModal);
  }, [searchParams]);

  const openModal = useCallback((url: string, options?: { 
    commentId?: string;
    reactionId?: string;
    notificationId?: string;
    replyCommentId?: string;
  }) => {
    previousUrlRef.current = window.location.pathname + window.location.search;
    
    const newUrl = new URL(url, window.location.origin);
    newUrl.searchParams.set("modal", "true");
    
    if (options?.commentId) newUrl.searchParams.set("comment_id", options.commentId);
    if (options?.reactionId) newUrl.searchParams.set("reaction_id", options.reactionId);
    if (options?.notificationId) newUrl.searchParams.set("notification_id", options.notificationId);
    if (options?.replyCommentId) newUrl.searchParams.set("reply_comment_id", options.replyCommentId);
    
    window.history.pushState(
      { previousUrl: previousUrlRef.current }, 
      '', 
      newUrl.pathname + newUrl.search
    );
    
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  const closeModal = useCallback(() => {
    window.history.back();
  }, []);

  const closeModalWithBack = useCallback(() => {
    window.history.back();
  }, []);

  return {
    isModalOpen,
    openModal,
    closeModal,
    closeModalWithBack,
    previousUrl: previousUrlRef.current
  };
}