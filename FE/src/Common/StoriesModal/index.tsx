import { FC, useEffect, useRef, useState } from "react";
import { Col, Container, Modal, ModalBody, Row, Button } from "reactstrap";
import { StoriesModalProps, Story, StoryItem } from "../CommonInterFace";
import ModalLeftBox from "./ModalLeftBox";
import { Href, ImagePath, Public } from "../../utils/constant/index";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import {
  createStory,
  getStories,
  markStoryAsSeen,
} from "@/service/storiesService";
import { formatTimeAgo } from "@/utils/formatTime";
import styles from "@/style/stories.module.css";
import { toast } from "react-toastify";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";

const StoriesModal: FC<StoriesModalProps> = ({
  showModal,
  toggle,
  initialUserIndex,
}) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(1);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showAddStoryView, setShowAddStoryView] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    url: string;
    type: "video" | "image";
  } | null>(null);
  const [storyCreationMode, setStoryCreationMode] = useState<
    "text" | "image" | "video" | "video_with_text" | "image_with_text" | null
  >(null);
  const [storyText, setStoryText] = useState("");
  const [textPosition, setTextPosition] = useState({ top: 50, left: 50 });
  const [backgroundColor, setBackgroundColor] = useState("#4267B2");
  const [showTextInput, setShowTextInput] = useState(false);
  const [textStyle, setTextStyle] = useState({
    color: "#333333",
    fontSize: 24,
  });
  const [visibility, setVisibility] = useState("public");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [videoMuted, setVideoMuted] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (showModal) {
      getStories().then((data) => {
        const storiesData = data.stories || data;
        setStories(data.stories || data);
        if (initialUserIndex !== undefined) {
          const selectedStory = storiesData.find(
            (story: Story) => story.id === initialUserIndex
          );
          const indexSelected = storiesData.findIndex(
            (story: Story) => story.id === selectedStory.id
          );
          setCurrentUserIndex(indexSelected);

          if (selectedStory) {
            const firstUnseenIndex = selectedStory.items.findIndex(
              (item: StoryItem) => !item.is_seen
            );
            const startIndex = firstUnseenIndex >= 0 ? firstUnseenIndex : 0;
            setCurrentStoryIndex(startIndex);
          }
        }
      });
    }
  }, [showModal]);

  useEffect(() => {}, [currentStoryIndex]);
  const STORY_DURATION = 5000;

  const currentStory = stories[currentUserIndex];
  const currentItem = currentStory?.items[currentStoryIndex];

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleAddTextToImage = () => {
    setShowTextInput(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !previewRef.current) return;
    const container = previewRef.current.parentElement;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const textRect = previewRef.current.getBoundingClientRect();

    const newLeftPx = e.clientX - containerRect.left - textRect.width / 2;
    const newTopPx = e.clientY - containerRect.top - textRect.height / 2;

    const maxLeft = containerRect.width - textRect.width;
    const maxTop = containerRect.height - textRect.height;

    const boundedLeftPx = Math.max(0, Math.min(newLeftPx, maxLeft));
    const boundedTopPx = Math.max(0, Math.min(newTopPx, maxTop));

    const boundedLeftPercent = (boundedLeftPx / containerRect.width) * 100;
    const boundedTopPercent = (boundedTopPx / containerRect.height) * 100;

    setTextPosition({
      top: boundedTopPercent,
      left: boundedLeftPercent,
    });
  };

  const handleShareStory = async () => {
    const payload: {
      items: {
        type: string;
        file_url?: string | null;
        text?: string;
        text_position?: { top: number; left: number };
        text_style?: { color: string; fontSize: number };
        background?: string;
        duration?: number;
        music_name?: string;
      }[];
    } = {
      items: [],
    };

    let uploadedFileUrl: string | null = null;
    let duration: number = STORY_DURATION;

    if (storyCreationMode === "image" || storyCreationMode === "video") {
      try {
        if (!selectedFile) {
          toast.error("Vui lòng chọn ảnh hoặc video trước khi đăng.");
          return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile?.url || "");
        formData.append("muted", videoMuted.toString());
        formData.append("audio_url", selectedTrack?.audio || "");

        const response = await axiosInstance(
          `${API_ENDPOINTS.CLOUDINARY.UPLOAD}`,
          {
            method: "POST",
            data: formData,
          }
        );

        const data = await response.data;
        if (response.status !== 200)
          throw new Error(data.error?.message || "Upload failed");

        uploadedFileUrl = data.url;
        duration = data.duration;
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        toast.error("Không thể tải ảnh/video lên. Vui lòng thử lại.");
        return;
      }
    }

    if (storyCreationMode === "image" || storyCreationMode === "video") {
      payload.items.push({
        type: selectedFile?.type || storyCreationMode,
        text: storyText,
        text_style: {
          color: textStyle.color,
          fontSize: textStyle.fontSize,
        },
        text_position: {
          top: textPosition.top,
          left: textPosition.left,
        },
        file_url: uploadedFileUrl,
        duration: duration,
        music_name:
          selectedTrack?.name + " - " + selectedTrack?.artist_name || "",
      });
    }

    if (storyCreationMode === "text") {
      payload.items.push({
        type: storyCreationMode,
        text: storyText,
        text_style: {
          color: textStyle.color,
          fontSize: textStyle.fontSize,
        },
        background: backgroundColor,
      });
    }

    try {
      const story = await createStory(payload);
      toast.success(story.message);
    } catch (error) {
      console.error("Error creating story:", error);
    }
    resetStoryCreation();
    toggle();
  };

  const handleMarkAsSeen = async (storyId: string) => {
    try {
      await markStoryAsSeen(storyId);
      setStories((prevStories) =>
        prevStories.map((story) =>
          story.id === storyId
            ? {
                ...story,
                items: story.items.map((item) => ({
                  ...item,
                  is_seen: true,
                })),
              }
            : story
        )
      );
    } catch (error) {
      console.error("Error marking story as seen:", error);
    }
  };

  const startStoryTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const duration = currentItem?.type.includes("video")
      ? 10000
      : STORY_DURATION;
    const increment = 100 / (duration / 100);

    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev >= 100) {
            nextStory();
            return 0;
          }
          return prev + increment;
        });
      }
    }, 100);
  };

  const nextStory = async () => {
    if (!currentStory) return;

    // Mark current story as seen if not already seen
    if (currentItem && !currentItem.is_seen) {
      await handleMarkAsSeen(currentStory.id);
    }

    // Check if there's a next item in current story (regardless of seen status)
    if (currentStoryIndex < currentStory.items.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
      return;
    }

    // Move to next user
    if (currentUserIndex < stories.length - 1) {
      const nextUserIndex = currentUserIndex + 1;
      const nextStory = stories[nextUserIndex];

      // Find first unseen item, if none exist, start from first item
      const firstUnseenIndex = findNextUnseenItem(nextStory);
      const startIndex = firstUnseenIndex >= 0 ? firstUnseenIndex : 0;

      setCurrentUserIndex(nextUserIndex);
      setCurrentStoryIndex(startIndex);
      setProgress(0);

      // Mark as seen if starting from an unseen item
      if (firstUnseenIndex >= 0) {
        await handleMarkAsSeen(nextStory.id);
      }
    } else {
      // At the end, loop back to first user and first story
      setCurrentUserIndex(0);
      setCurrentStoryIndex(0);
      setProgress(0);
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setProgress(0);
    } else if (currentUserIndex > 0) {
      const prevUserIndex = currentUserIndex - 1;
      const prevUserStory = stories[prevUserIndex];

      setCurrentUserIndex(prevUserIndex);
      setCurrentStoryIndex(prevUserStory.items.length - 1);
      setProgress(0);
    }
  };

  const goToStory = (storyIndex: number) => {
    setCurrentStoryIndex(storyIndex);
    setProgress(0);
  };

  const findNextUnseenItem = (story: Story, startIndex: number = 0) => {
    for (let i = startIndex; i < story.items.length; i++) {
      if (!story.items[i].is_seen) {
        return i;
      }
    }
    return -1;
  };

  const handleUserSelect = async (userIndex: number) => {
    console.log(userIndex);
    const story = stories[userIndex];
    if (!story) return;

    // Find first unseen item, if none exist, start from first item
    const firstUnseenIndex = findNextUnseenItem(story);
    const startIndex = firstUnseenIndex >= 0 ? firstUnseenIndex : 0;

    setCurrentUserIndex(userIndex);
    setCurrentStoryIndex(startIndex);
    setProgress(0);
    setShowAddStoryView(false);

    // Mark as seen if starting from an unseen item
    if (firstUnseenIndex >= 0) {
      await handleMarkAsSeen(story.id);
    }
  };

  const handleAddStory = (type: "text" | "image" | "video") => {
    setStoryCreationMode(type);
    if (type === "image" || type === "video") {
      fileInputRef.current?.click();
    } else {
      setStoryText("");
      setBackgroundColor("#4267B2");
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedFile({
          url: e.target?.result as string,
          type: file.type.startsWith("video") ? "video" : "image",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetStoryCreation = () => {
    setShowAddStoryView(false);
    setStoryCreationMode(null);
    setSelectedFile(null);
    setStoryText("");
    setShowTextInput(false);
    setBackgroundColor("#4267B2");
    setTextPosition({ top: 50, left: 50 });
  };

  const handleShowAddStory = () => {
    setShowAddStoryView(true);
  };

  useEffect(() => {
    if (showModal && currentStory && !showAddStoryView) {
      startStoryTimer();
      // Mark story as seen when viewed
      if (currentItem && !currentItem.is_seen) {
        handleMarkAsSeen(currentStory.id);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    showModal,
    currentStoryIndex,
    currentUserIndex,
    isPaused,
    showAddStoryView,
  ]);

  const renderStoryContent = () => {
    if (!currentItem) return null;

    if (currentItem.type === "text") {
      return (
        <div
          className={styles.containerStyle + " " + currentItem.background}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className={styles.textContainer}
            style={{
              color: currentItem.text_style?.color || "#fff",
              fontSize: currentItem.text_style?.fontSize || 24,
              fontWeight: currentItem.text_style?.fontWeight || "normal",
              position: "absolute",
              top: currentItem.text_position?.top
                ? `${currentItem.text_position.top}%`
                : "50%",
              left: currentItem.text_position?.left
                ? `${currentItem.text_position.left}%`
                : "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              padding: "20px",
              maxWidth: "80%",
              wordWrap: "break-word",
            }}
          >
            {currentItem.text}
          </div>
        </div>
      );
    }
    if (selectedFile?.type === "video") {
      return (
        <div className={styles.containerStyle}>
          <video
            ref={videoRef}
            src={currentItem.file_url || ""}
            className={styles.containerStyle}
            autoPlay
            muted
            onEnded={nextStory}
          />
          {currentItem.text && (
            <div
              className={styles.textVideo}
              style={{
                color: currentItem.text_style?.color || "#fff",
                fontSize: currentItem.text_style?.fontSize || 16,
                fontWeight: currentItem.text_style?.fontWeight || "normal",
                top: currentItem.text_position?.top
                  ? `${currentItem.text_position.top}%`
                  : "20%",
                left: currentItem.text_position?.left
                  ? `${currentItem.text_position.left}%`
                  : "10%",
              }}
            >
              {currentItem.text}
            </div>
          )}
        </div>
      );
    }

    if (currentItem.type === "image") {
      return (
        <div className={styles.containerStyle}>
          <img
            src={currentItem.file_url || ""}
            alt="Story"
            className={styles.containerStyle}
          />
          {currentItem.text && (
            <div
              className={styles.textVideo}
              style={{
                color: currentItem.text_style?.color || "#fff",
                fontSize: currentItem.text_style?.fontSize || 16,
                fontWeight: currentItem.text_style?.fontWeight || "normal",
                top: currentItem.text_position?.top
                  ? `${currentItem.text_position.top}%`
                  : "20%",
                left: currentItem.text_position?.left
                  ? `${currentItem.text_position.left}%`
                  : "10%",
              }}
            >
              {currentItem.text}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const renderStoryPreview = () => {
    if (storyCreationMode === "text") {
      return (
        <div className={styles.cardPreview}>
          <div className={styles.cardPreviewHeader}>
            <div className={styles.cardPreviewTitle}>Xem trước</div>
            <div className={styles.story_Preview}>
              <div
                className={styles.text_story_preview + " " + backgroundColor}
                style={{
                  color: textStyle.color,
                  fontSize: textStyle.fontSize,
                }}
              >
                {storyText || "Nhập văn bản của bạn..."}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (
      (storyCreationMode === "image" || storyCreationMode === "video") &&
      selectedFile
    ) {
      return (
        <div className={styles.cardPreview}>
          <div className={styles.cardPreviewHeader}>
            <div className={styles.cardPreviewTitle}>Xem trước</div>
            <div className={styles.story_Preview}>
              {selectedFile.type === "video" ? (
                <div className={styles.image_story_preview}>
                  <video
                    src={selectedFile.url}
                    controls
                    className={styles.previewVideo}
                    style={{ width: "100%", borderRadius: "10px" }}
                  />
                  {showTextInput && storyText && (
                    <div
                      ref={previewRef}
                      className={styles.text_story_preview_position}
                      onMouseDown={handleMouseDown}
                      style={{
                        top: `${textPosition.top}%`,
                        left: `${textPosition.left}%`,
                        color: `${textStyle.color}`,
                        fontSize: `${textStyle.fontSize}px`,
                        fontWeight: "bold",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                        padding: "8px",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        borderRadius: "4px",
                        maxWidth: "80%",
                        wordWrap: "break-word",
                      }}
                    >
                      {storyText}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={styles.image_story_preview}
                  style={{
                    backgroundImage: `url(${selectedFile.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    position: "relative",
                  }}
                >
                  {showTextInput && storyText && (
                    <div
                      ref={previewRef}
                      className={styles.text_story_preview_position}
                      onMouseDown={handleMouseDown}
                      style={{
                        top: `${textPosition.top}%`,
                        left: `${textPosition.left}%`,
                        color: `${textStyle.color}`,
                        fontSize: `${textStyle.fontSize}px`,
                        fontWeight: "bold",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                        padding: "8px",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        borderRadius: "4px",
                        maxWidth: "80%",
                        wordWrap: "break-word",
                      }}
                    >
                      {storyText}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: "100vh", backgroundColor: "#1c1c1d" }}
      >
        <div className="text-center">
          <h5 className="mb-4">Chọn loại bảng tin</h5>
          <div className="d-flex gap-3 justify-content-center">
            <Button
              color="primary"
              className="d-flex flex-column align-items-center p-3"
              onClick={() => handleAddStory("text")}
            >
              <i className="fa fa-font mb-2" style={{ fontSize: "24px" }}></i>
              <span>Thêm văn bản</span>
            </Button>
            <Button
              color="success"
              className="d-flex flex-column align-items-center p-3"
              onClick={() => handleAddStory("image")}
            >
              <i className="fa fa-image mb-2" style={{ fontSize: "24px" }}></i>
              <span>Thêm ảnh/video</span>
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*,video/*"
            style={{ display: "none" }}
          />
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={showModal} toggle={toggle} modalClassName="story-model">
      <ModalBody className="p-0">
        <div className="story-bg">
          <Container fluid className="p-0">
            <Row className="m-0">
              <ModalLeftBox
                stories={stories}
                currentUserIndex={currentUserIndex}
                onUserSelect={handleUserSelect}
                formatTimeAgo={formatTimeAgo}
                onMarkAsSeen={handleMarkAsSeen}
                onShowAddStory={handleShowAddStory}
                storyCreationMode={storyCreationMode}
                selectedFile={selectedFile}
                storyText={storyText}
                backgroundColor={backgroundColor}
                showTextInput={showTextInput}
                setStoryText={setStoryText}
                handleAddTextToImage={handleAddTextToImage}
                handleShareStory={handleShareStory}
                setBackgroundColor={setBackgroundColor}
                resetStoryCreation={resetStoryCreation}
                textStyle={textStyle}
                setTextStyle={setTextStyle}
                visibility={visibility}
                setVisibility={setVisibility}
                selectedTrack={selectedTrack}
                setSelectedTrack={setSelectedTrack}
                setVideoMuted={setVideoMuted}
                videoMuted={videoMuted}
              />
              <Col xl="9" lg="8" className="right-box p-0">
                <a href={Href} onClick={toggle}>
                  <DynamicFeatherIcon
                    iconName="X"
                    className="icon-light close"
                  />
                </a>

                {showAddStoryView ? (
                  <div className={styles.storyPreview}>
                    {renderStoryPreview()}
                  </div>
                ) : currentStory ? (
                  <>
                    <div
                      className={
                        styles.storyProgressContainer +
                        " story-progress-container"
                      }
                      style={{
                        position: "absolute",
                        top: "20px",
                        left: "20px",
                        right: "60px",
                        zIndex: 1000,
                        display: "flex",
                        gap: "4px",
                      }}
                    >
                      {currentStory.items.map(
                        (
                          _,
                          index // 2 1
                        ) => (
                          <div
                            key={index}
                            className={styles.storyProgress}
                            onClick={() => goToStory(index)}
                          >
                            <div
                              className={styles.storyPro}
                              style={{
                                width:
                                  index < currentStoryIndex
                                    ? "100%"
                                    : index === currentStoryIndex
                                    ? `${progress}%`
                                    : "0%",
                                transition:
                                  index === currentStoryIndex
                                    ? "none"
                                    : "width 0.3s ease",
                              }}
                            />
                          </div>
                        )
                      )}
                    </div>

                    <div className={styles.userInfo}>
                      <img
                        src={currentStory.user.avatar}
                        alt={currentStory.user.username}
                        className={styles.userAvatar}
                      />
                      <div>
                        <div className={styles.userName}>
                          {currentStory.user.first_name}{" "}
                          {currentStory.user.last_name}
                        </div>
                        <div className={styles.userTime}>
                          {currentItem?.created_at
                            ? formatTimeAgo(currentItem.created_at)
                            : ""}
                        </div>
                      </div>
                    </div>

                    <div
                      className="slider_Container"
                      style={{
                        position: "relative",
                        height: "100vh",
                        backgroundColor: "#000",
                      }}
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                    >
                      {renderStoryContent()}

                      <div
                        className={styles.leftClickArea}
                        onClick={prevStory}
                      />

                      <div
                        className={styles.rightClickArea}
                        onClick={nextStory}
                      />
                    </div>
                  </>
                ) : null}

                {!showAddStoryView && (
                  <div className="reply-section">
                    <div className="reply-form">
                      <input className="form-control" placeholder="reply..." />
                    </div>
                    <ul className="emoji icon-xl">
                      <li>
                        <img
                          src="../assets/svg/emoji/040.svg"
                          className="img-fluid blur-up lazyloaded"
                          alt="smile"
                        />
                      </li>
                      <li>
                        <img
                          src="../assets/svg/emoji/113.svg"
                          className="img-fluid blur-up lazyloaded"
                          alt="smile"
                        />
                      </li>
                      <li>
                        <img
                          src="../assets/svg/emoji/027.svg"
                          className="img-fluid blur-up lazyloaded"
                          alt="smile"
                        />
                      </li>
                      <li>
                        <img
                          src="../assets/svg/emoji/052.svg"
                          className="img-fluid blur-up lazyloaded"
                          alt="smile"
                        />
                      </li>
                      <li>
                        <img
                          src="../assets/svg/emoji/039.svg"
                          className="img-fluid blur-up lazyloaded"
                          alt="smile"
                        />
                      </li>
                      <li>
                        <img
                          src="../assets/svg/emoji/042.svg"
                          className="img-fluid blur-up lazyloaded"
                          alt="smile"
                        />
                      </li>
                    </ul>
                  </div>
                )}
              </Col>
            </Row>
          </Container>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default StoriesModal;
