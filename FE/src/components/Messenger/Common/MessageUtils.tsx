// src/services/MessageUtils.tsx
import { Message } from "@/hooks/useSocket";
import { SharePostMetadata } from "../MessengerType";

export const shouldShowTimestamp = (
  currentMessage: { created_at: string; sender_id: string },
  previousMessage: { created_at: string; sender_id: string } | null
): boolean => {
  if (!previousMessage) return true;

  const currentTime = new Date(currentMessage.created_at).getTime();
  const previousTime = new Date(previousMessage.created_at).getTime();
  const timeDiff = currentTime - previousTime;
  const timeThreshold = 5 * 60 * 1000;

  return timeDiff > timeThreshold || currentMessage.sender_id !== previousMessage.sender_id;
};

export const renderMessageContent = (
  message: Message,
  scrollToBottom: () => void,
  shouldScrollToBottom: React.MutableRefObject<boolean>
) => {
  if (message.type === "share_post") {
    return renderSharedPost(message);
  }
  if (message.type === "image" && message.content) {
    return (
      <div className="message-image-container">
        <img
          src={message.content}
          alt="Shared image"
          className="message-image"
          loading="lazy"
          style={{ width: "100px", height: "100px", objectFit: "cover" }}
          onLoad={() => {     //*
            if (shouldScrollToBottom.current) {
              scrollToBottom();
            }
          }}
        />
      </div>
    );
  }
  return message.content;
};

export const renderPendingMessage = (message: {
  id: string;
  content: string;
  type: string;
  tempUrl?: string;
  created_at: string;
  sender_id: string;
}, isUploading: boolean) => {
  if (message.type === "image") {
    return (
      <div className="message-image-container">
        <div style={{ position: "relative" }}>
          <img
            src={message.content}
            alt="Đang tải ảnh..."
            className="message-image"
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
              opacity: "0.7",
            }}
          />
          {isUploading && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className="spinner"
                style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid #ccc",
                  borderTopColor: "#333",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
  return message.content;
};

export const renderSharedPost = (message: Message) => {
  try {
    const rawMetadata = message.metadata as SharePostMetadata;
    const metadata: SharePostMetadata =
      typeof rawMetadata === "string" ? JSON.parse(rawMetadata) : rawMetadata;
    return (
      <div
        className="shared-post-container"
        style={{
          border: "1px solid #e4e6ea",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#f8f9fa",
          maxWidth: "350px",
          cursor: "pointer",
        }}
      >
        {message.content && (
          <div
            style={{
              padding: "12px",
              fontSize: "14px",
              lineHeight: "1.4",
            }}
          >
            {message.content}
          </div>
        )}

        <div
          className="post-preview"
          onClick={() => {
            if (metadata.url) {
              window.open(
                metadata.url.startsWith("http") ? metadata.url : `/${metadata.url}`,
                "_blank"
              );
            }
          }}
          style={{
            backgroundColor: "white",
            border: "1px solid #e4e6ea",
            borderRadius: "8px",
            margin: "0 12px 12px 12px",
            overflow: "hidden",
          }}
        >
          {metadata.image && (
            <div style={{ position: "relative", width: "100%", height: "200px" }}>
              <img
                src={metadata.image}
                alt="Post preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          <div style={{ padding: "12px" }}>
            <div
              style={{
                fontSize: "14px",
                lineHeight: "1.4",
                color: "#1c1e21",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical" as const,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {metadata.content || "Xem bài viết..."}
            </div>

            <div
              style={{
                marginTop: "8px",
                fontSize: "12px",
                color: "#65676b",
                textTransform: "uppercase",
              }}
            >
              Bài viết #{metadata.post_id}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Lỗi phân tích metadata bài viết được chia sẻ:", error);
    return (
      <div
        style={{
          padding: "12px",
          backgroundColor: "#ffebee",
          borderRadius: "8px",
          color: "#c62828",
          fontSize: "14px",
        }}
      >
        Không thể hiển thị bài viết được chia sẻ
      </div>
    );
  }
};