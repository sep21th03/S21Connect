// src/services/SocketService.ts
import { Message, RecentMessage } from "@/hooks/useSocket";

export const setupSocketListeners = (
  user: RecentMessage,
  session: { user?: { id?: string } } | null,
  initialConversationId: string | undefined,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setPendingMessages: React.Dispatch<
    React.SetStateAction<
      {
        id: string;
        content: string;
        type: string;
        tempUrl?: string;
        created_at: string;
        sender_id: string;
      }[]
    >
  >,
  setIsUploading: (uploading: boolean) => void,
  setPendingImage: (image: File | null) => void,
  scrollToBottom: () => void,
  joinChat: (conversationId: string) => void,
  leaveChat: (conversationId: string) => void,
  markMessagesAsRead: (conversationId: string) => void,
  onNewMessage: (
    callback: (message: Message) => void
  ) => (() => void) | undefined,
  onImageUploadStatus: (
    callback: (status: { status: string; url?: string; message?: string }) => void
  ) => (() => void) | undefined
) => {
  if (!user) {
    return () => {};
  }

  const userId = user.other_user.id;
  const conversationId = user.id;

  if (conversationId) {
    joinChat(conversationId);
    markMessagesAsRead(conversationId);
  }

  const cleanup = onNewMessage((message) => {
    if (
      (message.sender_id === userId || message.sender_id === session?.user?.id) &&
      message.conversation_id === conversationId
    ) {
        setMessages((prevMessages) => {
            // Kiểm tra xem tin nhắn đã tồn tại chưa
            if (prevMessages.some((msg) => msg.id === message.id)) {
              return prevMessages;
            }
    
            // Xóa tin nhắn pending nếu có client_temp_id
            if (message.client_temp_id) {
              setPendingMessages((prev) =>
                prev.filter((msg) => msg.id !== message.client_temp_id)
              );
              setIsUploading(false);
            }
    
            // Chỉ scroll khi tin nhắn mới được thêm
            scrollToBottom();
            return [...prevMessages, message];
          });

      if (message.sender_id !== session?.user?.id) {
        markMessagesAsRead(conversationId);
      }
    }
  });

  const uploadStatusCleanup = onImageUploadStatus(
    (status: { status: string; url?: string; message?: string }) => {
      if (status.status === "success") {
        setIsUploading(false);
        setPendingImage(null);
        setPendingMessages((prev) =>
          prev.map((msg) => {
            if (msg.type === "image" && msg.tempUrl) {
              return { ...msg, content: status.url || "" };
            }
            return msg;
          })
        );
      } else if (status.status === "error") {
        console.error("Image upload failed:", status.message);
        setIsUploading(false);
        setPendingImage(null);
        setPendingMessages((prev) => prev.filter((msg) => msg.type !== "image"));
        alert("Failed to upload image: " + status.message);
      }
    }
  );

  return () => {
    cleanup?.();
    uploadStatusCleanup?.();
    if (conversationId) {
      leaveChat(conversationId);
    }
  };
};