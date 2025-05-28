import { FC, useEffect, useState } from "react";
import {
  Button,
  Col,
  DropdownMenu,
  Dropdown,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { Story } from "../CommonInterFace";
import { Href, ImagePath } from "../../utils/constant/index";
import styles from "@/style/stories.module.css";
import { createPostDropDown } from "@/Data/common";
import DynamicFeatherIcon from "../DynamicFeatherIcon";
import { searchTracks } from "@/service/mockupSercive";

const ModalLeftBox: FC<{
  stories: Story[];
  currentUserIndex: number;
  onUserSelect: (index: number) => void;
  formatTimeAgo: (date: string) => string;
  onMarkAsSeen: (storyId: string) => void;
  onShowAddStory: () => void;
  storyCreationMode?:
    | "text"
    | "image"
    | "video"
    | "video_with_text"
    | "image_with_text"
    | null;
  selectedFile?: {
    url: string;
    type: "video" | "image";
  } | null;
  storyText?: string;
  backgroundColor?: string;
  showTextInput?: boolean;
  setStoryText: (text: string) => void;
  handleAddTextToImage: () => void;
  handleShareStory: () => void;
  resetStoryCreation: () => void;
  setBackgroundColor: (color: string) => void;
  textStyle: { color: string; fontSize: number };
  setTextStyle: (textStyle: { color: string; fontSize: number }) => void;
  visibility: string;
  setVisibility: (visibility: string) => void;
  selectedTrack: any;
  setSelectedTrack: (track: any) => void;
  videoMuted: boolean;
  setVideoMuted: (muted: boolean) => void;
}> = ({
  stories,
  currentUserIndex,
  onUserSelect,
  formatTimeAgo,
  onMarkAsSeen,
  onShowAddStory,
  storyCreationMode,
  selectedFile,
  storyText,
  backgroundColor,
  showTextInput,
  setStoryText,
  handleAddTextToImage,
  handleShareStory,
  resetStoryCreation,
  setBackgroundColor,
  textStyle,
  setTextStyle,
  visibility,
  setVisibility,
  selectedTrack,
  setSelectedTrack,
  videoMuted,
  setVideoMuted,
}) => {
  const myStories = stories.filter((story) => story.is_mine);
  const otherStories = stories.filter((story) => !story.is_mine);
  const [showSettings, setShowSettings] = useState(false);

  const [musicQuery, setMusicQuery] = useState("");
  const [musicResults, setMusicResults] = useState([]);

  useEffect(() => {
    if (musicQuery.trim()) {
      const timer = setTimeout(async () => {
        const tracks = await searchTracks(musicQuery);
        setMusicResults(tracks);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [musicQuery]);

  const handleUserSelect = (story: Story) => {
    const globalIndex = stories.findIndex((s) => s.id === story.id);
    onMarkAsSeen(story.id);
    onUserSelect(globalIndex);
  };

  const hasUnseenItems = (story: Story) => {
    return story.items.some((item) => !item.is_seen);
  };

  const currentStoryId = stories[currentUserIndex]?.id;

  const renderAddStoryView = () => {
    if (storyCreationMode === "text") {
      return (
        <div className="p-4 h-100 d-flex flex-column justify-content-between">
          <div>
            <FormGroup>
              <Input
                type="textarea"
                id="storyText"
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                placeholder="Nhập nội dung bảng tin..."
                rows={4}
              />
            </FormGroup>

            <FormGroup>
              <div className="d-flex gap-2 flex-wrap mt-2">
                {[
                  "gr-1",
                  "gr-2",
                  "gr-3",
                  "gr-4",
                  "gr-5",
                  "gr-6",
                  "gr-7",
                  "gr-8",
                  "gr-9",
                  "gr-10",
                  "gr-11",
                  "gr-12",
                  "gr-13",
                  "gr-14",
                  "gr-15",
                ].map((color) => (
                  <div
                    key={color}
                    className={`rounded-circle ${color} ${
                      backgroundColor === color
                        ? "border border-dark border-3"
                        : ""
                    }`}
                    style={{
                      width: "40px",
                      height: "40px",
                      cursor: "pointer",
                    }}
                    onClick={() => setBackgroundColor(color)}
                  />
                ))}
              </div>
            </FormGroup>

            <FormGroup>
              <Label for="fontSize">Cỡ chữ (10-64px)</Label>
              <Input
                type="number"
                id="fontSize"
                min={10}
                max={64}
                value={textStyle.fontSize}
                onChange={(e) => {
                  const value = Math.min(64, parseInt(e.target.value));
                  setTextStyle({
                    ...textStyle,
                    fontSize: value,
                  });
                }}
              />
            </FormGroup>
            <FormGroup>
              <Label for="textColor">Chọn màu chữ</Label>
              <Input
                type="color"
                id="textColor"
                value={textStyle.color}
                onChange={(e) =>
                  setTextStyle({ ...textStyle, color: e.target.value })
                }
                style={{ width: "60px", height: "40px", padding: "2px" }}
              />
            </FormGroup>
          </div>
          <div className="d-flex gap-2 mt-4">
            <Button color="light" onClick={resetStoryCreation}>
              Bỏ
            </Button>
            <Button
              color="primary"
              onClick={handleShareStory}
              disabled={!storyText?.trim()}
            >
              Chia sẻ
            </Button>
          </div>
        </div>
      );
    }

    if (
      (storyCreationMode === "image" || storyCreationMode === "video") &&
      selectedFile
    ) {
      return (
        <div className="p-4 h-100 d-flex flex-column justify-content-between">
          {!showTextInput ? (
            <>
              <div>
                <div className="w-100 mb-3" onClick={handleAddTextToImage}>
                  <div className={styles.add_text_to_image}>
                    <span>Thêm văn bản</span>
                  </div>
                </div>

                <FormGroup>
                  <Label for="musicSearch" style={{fontWeight: "bold"}}>Thêm nhạc nền</Label>
                  <Input
                    id="musicSearch"
                    value={musicQuery}
                    onChange={(e) => setMusicQuery(e.target.value)}
                    placeholder="Tìm kiếm nhạc nền..."
                  />
                  {selectedTrack && (
                    <div className="mt-2 p-2 bg-light rounded">
                      <small className="text-muted">Đã chọn:</small>
                      <div><strong>{selectedTrack.name}</strong> - {selectedTrack.artist_name}</div>
                      <Button 
                        size="sm" 
                        color="link" 
                        className="p-0"
                        onClick={() => setSelectedTrack(null)}
                      >
                        Bỏ chọn
                      </Button>
                    </div>
                  )}
                </FormGroup>

                {musicResults.length > 0 && (
                  <div
                    className="music-results mt-2"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                  >
                    {musicResults.map((track: any) => (
                      <div
                        key={track.id}
                        className={`p-2 border rounded mb-1 ${
                          selectedTrack?.id === track.id
                            ? "bg-primary text-white"
                            : "bg-light"
                        }`}
                        onClick={() => setSelectedTrack(track)}
                        style={{ cursor: "pointer" }}
                      >
                        <div>
                          <strong>{track.name}</strong> – {track.artist_name}
                        </div>
                        <audio controls src={track.audio}></audio>
                      </div>
                    ))}
                  </div>
                )}
                {selectedFile.type === "video" && (
                  <FormGroup className="mt-3">
                    <div className="d-flex align-items-center gap-2">
                      <Label className="mb-0" style={{ fontWeight: "bold" }}>
                        Âm thanh video:
                      </Label>
                      <Button
                        color={videoMuted ? "danger" : "primary"}
                        size="sm"
                        onClick={() => setVideoMuted(!videoMuted)}
                      >
                        {videoMuted ? (
                          <DynamicFeatherIcon
                            iconName="VolumeX"
                            className="me-1"
                          />
                        ) : (
                          <DynamicFeatherIcon
                            iconName="Volume2"
                            className="me-1"
                          />
                        )}
                      </Button>
                    </div>
                  </FormGroup>
                )}
              </div>
              <div className="d-flex gap-2 mt-4">
                <Button color="light" onClick={resetStoryCreation}>
                  Bỏ
                </Button>
                <Button color="primary" onClick={handleShareStory}>
                  Chia sẻ
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <FormGroup>
                  <Label for="imageText">Nhập văn bản:</Label>
                  <Input
                    type="textarea"
                    id="imageText"
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    placeholder="Nhập văn bản cho ảnh..."
                    rows={3}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="fontSize">Cỡ chữ (10-64px)</Label>
                  <Input
                    type="number"
                    id="fontSize"
                    min={10}
                    max={64}
                    value={textStyle.fontSize}
                    onChange={(e) => {
                      const value = Math.min(64, parseInt(e.target.value));
                      setTextStyle({
                        ...textStyle,
                        fontSize: value,
                      });
                    }}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="textColor">Chọn màu chữ</Label>
                  <Input
                    type="color"
                    id="textColor"
                    value={textStyle.color}
                    onChange={(e) =>
                      setTextStyle({ ...textStyle, color: e.target.value })
                    }
                    style={{ width: "60px", height: "40px", padding: "2px" }}
                  />
                </FormGroup>
              </div>
              <div className="d-flex gap-2 mt-4">
                <Button color="light" onClick={resetStoryCreation}>
                  Bỏ
                </Button>
                <Button color="primary" onClick={handleShareStory}>
                  Chia sẻ
                </Button>
              </div>
            </>
          )}
        </div>
      );
    }

    return null;
  };
  return (
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
            <li className="position-relative">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowSettings((prev) => !prev);
                }}
              >
                Cài đặt
              </a>

              {showSettings && (
                <div
                  className="setting-dropdown position-absolute"
                  style={{ zIndex: 1000, top: 0, left: 200 }}
                >
                  <Dropdown className="custom-dropdown arrow-none dropdown-sm btn--group show">
                    <DropdownMenu className="show" style={{ display: "block" }}>
                      <ul className="list-unstyled flex-column">
                        {createPostDropDown.map((data, index) => (
                          <li key={index}>
                            <a
                              href="#"
                              className={`d-flex align-items-center gap-2 py-1 px-2 rounded ${
                                visibility === data.slug ? "active" : ""
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                setVisibility(data.slug);
                                setShowSettings(false);
                              }}
                            >
                              <DynamicFeatherIcon
                                iconName={data.icon}
                                className="icon-font-light iw-16 ih-16"
                              />
                              {data.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
      <div className="modal-flex story-images h-100">
        {storyCreationMode === "text" ||
        ((storyCreationMode === "image" || storyCreationMode === "video") &&
          selectedFile) ? (
          <div className="story-creation-preview mb-4 h-100">
            {renderAddStoryView()}
          </div>
        ) : (
          <>
            <div className="add-story">
              <h4 className="story-title">Bảng tin của bạn</h4>
              <div
                className="list-media d-flex align-items-center p-2 mb-3"
                style={{ cursor: "pointer" }}
                onClick={onShowAddStory}
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

            <div className="friend-story theme-scrollbar">
              <h4 className="story-title">Tất cả bảng tin</h4>
              {otherStories.map((story, index) => {
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
          </>
        )}
      </div>
    </Col>
  );
};

export default ModalLeftBox;
