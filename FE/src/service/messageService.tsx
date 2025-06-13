import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { Message, RecentMessage, SendMessagePayload } from "@/hooks/useSocket";
import { toast } from "react-toastify";
import { ChatHistoryInterFace } from "@/components/Messenger/MessengerType";

export const sendMessage = async (payload: any) => {
    const response = await axiosInstance.post(API_ENDPOINTS.MESSAGES.MESSAGES.BASE + API_ENDPOINTS.MESSAGES.MESSAGES.SEND_MESSAGE, payload);
    return response.data;
  };



export const fetchMessages = async (
  conversationId: string,
  page: number = 1,
  isLoadMore: boolean = false,
  setIsLoading: (loading: boolean) => void,
  setIsLoadingMore: (loading: boolean) => void,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setCurrentPage: (page: number) => void,
  setHasMoreMessages: (hasMore: boolean) => void,
  setTotalMessages: (total: number) => void,
  scrollToBottom: () => void
) => {
  try {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    const url = `${API_ENDPOINTS.MESSAGES.MESSAGES.BASE}${API_ENDPOINTS.MESSAGES.MESSAGES.GET_MESSAGES(conversationId)}?page=${page}&per_page=20`;
    const response = await axiosInstance.get(url);
    const responseData = response.data;

    const fetchedMessages = responseData.data || [];
    const pagination = {
      current_page: responseData.current_page || 1,
      last_page: responseData.last_page || 1,
      total: responseData.total || 0,
      per_page: responseData.per_page || 20,
    };

    if (isLoadMore) {
      setMessages((prevMessages) => [...fetchedMessages.reverse(), ...prevMessages]);
    } else {
      setMessages(fetchedMessages.reverse());
      scrollToBottom();
    }

    setCurrentPage(pagination.current_page);
    setHasMoreMessages(pagination.current_page < pagination.last_page);
    setTotalMessages(pagination.total);

    return fetchedMessages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  } finally {
    if (isLoadMore) {
      setIsLoadingMore(false);
    } else {
      setIsLoading(false);
    }
  }
};

export const markMessagesAsUnread = async (
  userId: string,
  messagesData: Message[],
  setUserList: React.Dispatch<React.SetStateAction<RecentMessage[] | null>>
) => {
  try {
    const unreadMessages = messagesData.filter(
      (message) => !message.is_read && message.sender_id === userId
    );
    if (unreadMessages.length > 0) {
      await axiosInstance.post(
        `${API_ENDPOINTS.MESSAGES.MESSAGES.BASE}${API_ENDPOINTS.MESSAGES.MESSAGES.UNREAD_MESSAGES}`,
        { receiver_id: userId }
      );

      setUserList((prevUsers) =>
        prevUsers?.map((u) =>
          u.id === userId ? { ...u, unread_count: 0 } : u
        ) ?? null
      );
    }
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
  }
};

export const handleSendMessage = async (
  newMessage: string,
  pendingImage: File | null,
  user: ChatHistoryInterFace["user"],
  session: { user?: { id?: string } } | null,
  setIsUploading: (uploading: boolean) => void,
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
  setNewMessage: (message: string) => void,
  setPendingImage: (image: File | null) => void,
  sendMessage: (payload: SendMessagePayload) => boolean,
  scrollToBottom: () => void,
  playNotificationSound: () => void
) => {
  if ((!newMessage.trim() && !pendingImage) || !user || !session?.user?.id) return;

  const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = new Date().toISOString();

  if (pendingImage) {
    setIsUploading(true);
    const tempUrl = URL.createObjectURL(pendingImage);
    setPendingMessages((prev) => [
      ...prev,
      {
        id: tempId,
        content: tempUrl,
        type: "image",
        tempUrl,
        created_at: createdAt,
        sender_id: session?.user?.id || "",
      },
    ]);
    scrollToBottom();

    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const base64Data = reader.result?.toString().split(",")[1];
        if (!base64Data) {
          console.error("Chuyển ảnh thành base64 thất bại");
          setIsUploading(false);
          return;
        }
        const success = sendMessage({
          content: base64Data,
          receiver_id:
          user.type === "private"
            ? user.other_user?.id
            : user.members?.find((m) => m.id === session?.user?.id)?.id || "",
          conversation_id: user.id,
          type: "image",
          file_name: pendingImage.name,
          file_type: pendingImage.type,
          client_temp_id: tempId,
        });

        if (!success) {
          console.error("Gửi ảnh thất bại");
          setIsUploading(false);
          setPendingMessages((prev) => prev.filter((msg) => msg.id !== tempId));
          toast.error("Không thể gửi ảnh, vui lòng thử lại");
        }
      } catch (error) {
        console.error("Lỗi gửi ảnh:", error);
        setIsUploading(false);
        setPendingMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        toast.error("Đã xảy ra lỗi khi gửi ảnh");
      }
      setPendingImage(null);
    };
    reader.readAsDataURL(pendingImage);
    return;
  }

  setPendingMessages((prev) => [
    ...prev,
    {
      id: tempId,
      content: newMessage,
      type: "text",
      created_at: createdAt,
      sender_id: session?.user?.id || "",
    },
  ]);
  scrollToBottom();

  const success = sendMessage({
    content: newMessage,
     receiver_id:
          user.type === "private"
            ? user.other_user?.id
            : user.members?.find((m) => m.id === session?.user?.id)?.id || "",
    conversation_id: user.id,
    type: "text",
    client_temp_id: tempId, 
  });

  if (!success) {
    console.error("Gửi tin nhắn văn bản thất bại");
    setPendingMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    toast.error("Không thể gửi tin nhắn, vui lòng thử lại");
  } else {
    setNewMessage("");
  }
};



export const getUserGalleryMessage = async (conversationId: string, perPage: number) => {
  try {
    const response = await axiosInstance.get(
      API_ENDPOINTS.MESSAGES.MESSAGES.GET_USER_GALLERY(conversationId),
      {
        params: { perPage },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Tải ảnh thất bại", error);
    throw error;
  }
};

export const searchMessages = async (
  conversationId: string,
  query: string
): Promise<Message[]> => {
  try {
    const url = `${
      API_ENDPOINTS.MESSAGES.MESSAGES.BASE
    }${API_ENDPOINTS.MESSAGES.MESSAGES.SEARCH_MESSAGES(
      conversationId,
      query
    )}`;
    const response = await axiosInstance.get(url);
    return response.data.data || [];
  } catch (error) {
    console.error("Error searching messages:", error);
    return [];
  }
};

export const archiveConversation = async (conversationId: string, isArchived: boolean) => {
  try {
    const response = await axiosInstance.post(
      `${API_ENDPOINTS.MESSAGES.MESSAGES.IS_ARCHIVED(conversationId)}`,
      {
        is_archived: isArchived,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error archiving conversation:", error);
    throw error;
  }
};


export interface Nickname {
  conversation_id: string;
  users: {
    id: string;
    nickname: string;
    first_name: string;
    last_name: string;
    avatar: string;
  }[];
}

export const getNickname = async (
  conversationId: string,
): Promise<Nickname> => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.MESSAGES.MESSAGES.GET_NICKNAME(conversationId));
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy biệt danh:", error);
    return { conversation_id: "", users: [] };
  }
};

export const updateNickname = async (
  conversationId: string,
  userId: string,
  nickname: string
): Promise<void> => {
  try {
    await axiosInstance.post(API_ENDPOINTS.MESSAGES.MESSAGES.UPDATE_NICKNAME(conversationId, userId), {
      nickname,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật biệt danh:", error);
  }
};

export const getGroupMembers = async (conversationId: string) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.MESSAGES.MESSAGES.GET_GROUP_MEMBERS(conversationId));
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy thành viên nhóm:", error);
    throw error;
  }
};



export const getRecentConversations  = async (archived: boolean = false) => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.MESSAGES.MESSAGES.RECENT_CONVERSATIONS,
    {
      params: { archived },
    }
  );
  return response.data;
};


export const fetchUnreadMessageCount = async () => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.MESSAGES.MESSAGES.GET_UNREAD_MESSAGES_COUNT
  );
  return response.data.unread_count;
};