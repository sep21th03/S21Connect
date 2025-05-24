import { FC, useEffect, useState, useRef } from "react";
import { Col, Container, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import { StoriesModalProps, Story } from "../CommonInterFace";
import { Href, ImagePath, Public } from "../../utils/constant/index";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import AddStoryModal from "./AddStoryModal";

const ModalLeftBox: FC<{
  stories: Story[];
  currentUserIndex: number;
  onUserSelect: (index: number) => void;
  formatTimeAgo: (date: string) => string;
  onMarkAsSeen: (storyId: string) => void;
}> = ({
  stories,
  currentUserIndex,
  onUserSelect,
  formatTimeAgo,
  onMarkAsSeen,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const myStories = stories.filter((story) => story.is_mine);
  const otherStories = stories.filter((story) => !story.is_mine);

  const handleAddStory = (type: "text" | "media") => {
    console.log(`Adding ${type} story`);
  };

  const handleUserSelect = (story: Story) => {
    const globalIndex = stories.findIndex((s) => s.id === story.id);
    onMarkAsSeen(story.id);
    onUserSelect(globalIndex);
  };

  const hasUnseenItems = (story: Story) => {
    return story.items.some((item) => !item.is_seen);
  };

  const currentStoryId = stories[currentUserIndex]?.id;

  return (
    <>
      <Col xl="3" lg="4" className="left-box">
        <div className="model-title">
          <div className="title-main">
            <h2>Bảng tin</h2>
          </div>
          <div className="title-setting">
            <ul>
              <li>
                <a href={Href}>Lưu trữ</a>
              </li>
              <li>
                <a href={Href}>Cài đặt</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="modal-flex story-images">
          {/* My Stories Section */}
          <div className="add-story">
            <h4 className="story-title">Bảng tin của bạn</h4>
            <div
              className="list-media d-flex align-items-center p-2 mb-3"
              style={{ cursor: "pointer" }}
              onClick={() => setShowAddModal(true)}
            >
              <div className="story-img me-3">
                <div className="user-img bg-size blur-up lazyloaded position-relative">
                  <img
                    src={`${ImagePath}/story-bg.jpg`}
                    className="img-fluid blur-up lazyload bg-img rounded-circle"
                    alt="user"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    className="add-icon position-absolute"
                    style={{ bottom: "0", right: "0" }}
                  >
                    <div
                      className="icon bg-primary rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "20px", height: "20px" }}
                    >
                      <span style={{ color: "white", fontSize: "12px" }}>
                        +
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="mb-1">Thêm bảng tin</h5>
                <h6 className="text-muted mb-0">Chia sẻ ảnh hoặc video</h6>
              </div>
            </div>

            {myStories.map((story, index) => {
              const lastItem = story.items[story.items.length - 1] || null;
              const isCurrentStory = story.id === currentStoryId;
              return (
              <div
                key={story.id}
                className={`list-media d-flex align-items-center p-2 mb-2 rounded ${
                  isCurrentStory
                    ? "bg-light"
                    : ""
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => handleUserSelect(story)}
              >
                <div className="story-img me-3">
                  <div
                    className={`user-img bg-size blur-up lazyloaded ${
                      hasUnseenItems(story)
                        ? "story-border-unseen"
                        : "story-border-seen"
                    }`}
                  >
                    <img
                      src={story.user.avatar}
                      className="bg-img rounded-circle"
                      alt="user"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <h5 className="mb-1">
                    {story.user.first_name} {story.user.last_name}
                  </h5>
                  <h6 className="text-muted mb-0">
                    {lastItem ? formatTimeAgo(lastItem.created_at) : ""}
                  </h6>
                </div>
                </div>
              );
            })}
          </div>

          <div className="friend-story theme-scrollbar">
            <h4 className="story-title">Tất cả bảng tin</h4>
            {otherStories.map((story, index) => {
              const actualIndex = otherStories.findIndex(
                (s) => s.id === story.id
              );
              const lastItem = story.items[story.items.length - 1] || null;
              const isCurrentStory = story.id === currentStoryId;
              return (
                <div
                  key={story.id}
                  className={`list-media d-flex align-items-center p-2 mb-2 rounded ${
                    isCurrentStory ? "bg-light" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleUserSelect(story)}
                >
                  <div className="story-img me-3">
                    <div
                      className={`user-img bg-size blur-up lazyloaded ${
                        hasUnseenItems(story)
                          ? "story-border-unseen"
                          : "story-border-seen"
                      }`}
                    >
                      <img
                        src={story.user.avatar}
                        className="bg-img rounded-circle"
                        alt="user"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <h5 className="mb-1">
                      {story.user.first_name} {story.user.last_name}
                    </h5>
                    <h6 className="text-muted mb-0">
                      {lastItem ? formatTimeAgo(lastItem.created_at) : ""}
                    </h6>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Col>

      <AddStoryModal
        isOpen={showAddModal}
        toggle={() => setShowAddModal(false)}
        onAddStory={handleAddStory}
      />
    </>
  );
};

export default ModalLeftBox;
