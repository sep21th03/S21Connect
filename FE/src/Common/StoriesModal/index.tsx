import { FC, useEffect, useRef, useState } from "react";
import { Col, Container, Modal, ModalBody, Row } from "reactstrap";
import { StoriesModalProps, Story, StoryItem } from "../CommonInterFace";
import ModalLeftBox from "./ModalLeftBox";
import { Href, ImagePath, Public } from "../../utils/constant/index";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { getStories, markStoryAsSeen } from "@/service/storiesService";
import { formatTimeAgo } from "@/utils/formatTime";
import styles from "@/style/stories.module.css";

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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (showModal) {
      getStories().then((data) => {
        const storiesData = data.stories || data;
        setStories(data.stories || data);
        if (initialUserIndex !== undefined) {
          const selectedStory = storiesData.find((story: Story) => story.id === initialUserIndex);
          const indexSelected = storiesData.findIndex((story: Story) => story.id === selectedStory.id);
          setCurrentUserIndex(indexSelected);

          if (selectedStory) {
            const firstUnseenIndex = selectedStory.items.findIndex((item: StoryItem) => !item.is_seen);
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
      setCurrentUserIndex((prev) => prev - 1);
      const prevStory = stories[currentUserIndex - 1];
      setCurrentStoryIndex(prevStory.items.length - 1);
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

    // Mark as seen if starting from an unseen item
    if (firstUnseenIndex >= 0) {
      await handleMarkAsSeen(story.id);
    }
  };

  useEffect(() => {
    if (showModal && currentStory) {
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
  }, [showModal, currentStoryIndex, currentUserIndex, isPaused]);

  const renderStoryContent = () => {
    if (!currentItem) return null;

    if (currentItem.type === "text") {
      return (
        <div
          className={styles.containerStyle}
          style={{
            backgroundColor: currentItem.color || "#000",
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

    if (currentItem.type.includes("video")) {
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
              />
              <Col xl="9" lg="8" className="right-box p-0">
                <a href={Href} onClick={toggle}>
                  <DynamicFeatherIcon
                    iconName="X"
                    className="icon-light close"
                  />
                </a>

                {currentStory && (
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

                    {/* User Info */}
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

                    {/* Story Content */}
                    <div
                      className="sliderContainer"
                      style={{
                        position: "relative",
                        height: "100vh",
                        backgroundColor: "#000",
                      }}
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                    >
                      {renderStoryContent()}

                      {/* Left click area - Previous story */}
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          width: "30%",
                          height: "100%",
                          cursor: "pointer",
                          zIndex: 100,
                        }}
                        onClick={prevStory}
                      />

                      {/* Right click area - Next story */}
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          width: "70%",
                          height: "100%",
                          cursor: "pointer",
                          zIndex: 100,
                        }}
                        onClick={nextStory}
                      />
                    </div>
                  </>
                )}

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
              </Col>
            </Row>
          </Container>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default StoriesModal;