import { FC, useState } from "react";
import { OverlayNames } from "../../Style1Types";
import {
  Href,
  ImagePath,
  Mute,
  ViewProfile,
} from "../../../../../utils/constant";
import { ButtonGroup } from "reactstrap";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import StoriesModal from "@/Common/StoriesModal";
import CustomImage from "@/Common/CustomImage";
import { Story } from "@/Common/CommonInterFace";

interface CommonStoryBoxProps {
  story?: Story;
  hasUnseen?: boolean;
  onClick?: () => void;
  isFakeStory?: boolean;
}

const CommonStoryBox: FC<CommonStoryBoxProps> = ({
  story,
  hasUnseen = false,
  onClick,
  isFakeStory = false,
}) => {
  const [showStoryModal, setShowStoryModal] = useState(false);
  const toggleStoryModal = () => setShowStoryModal(!showStoryModal);
  const [initialUserIndex, setInitialUserIndex] = useState<string | null>(null);

  const storyHasUnseen = story
    ? !story.is_mine && story.items.some((item) => !item.is_seen)
    : hasUnseen;

  const handleSelectedStory = () => {
    if (isFakeStory || onClick) {
      onClick?.();
      return;
    }

    setInitialUserIndex(story?.id || null);
    toggleStoryModal();
  };

  const handleIconClick = (e: any) => {
    e.stopPropagation();
    handleSelectedStory();
  };

  return (
    <>
      <div onClick={handleSelectedStory} style={{ cursor: "pointer" }}>
        <div>
          <div
            className={`story-box ${
              storyHasUnseen && !isFakeStory ? "unseen-highlight" : ""
            }`}
            style={{
              ...(storyHasUnseen && !isFakeStory
                ? {
                    border: "2px solid #007bff",
                    boxShadow: "0 0 8px rgba(0, 123, 255, 0.6)",
                    transition: "box-shadow 0.3s ease, border 0.3s ease",
                  }
                : {}),
              ...(isFakeStory
                ? {
                    backgroundColor: "#ffffff",
                    border: "1px solid #e0e0e0",
                    boxShadow: "0 0 4px rgba(0, 0, 0, 0.05)",
                  }
                : {}),
            }}
          >
            <div className={`adaptive-overlay}`} />
            <div className="story-bg bg-size">
              <CustomImage
                src={
                  story ? story.user.avatar : `${ImagePath}/story/story-bg.jpg`
                }
                className="img-fluid bg-img"
                alt="image"
              />
            </div>
            <div className="story-content">
              <h6>
                {story
                  ? story.is_mine
                    ? "Tin của bạn"
                    : `${story.user.first_name} ${story.user.last_name}`
                  : "josephin water"}
              </h6>
            </div>
            <div className="story-setting setting-dropdown">
              <ButtonGroup className="custom-dropdown arrow-none dropdown-sm">
                <a href={Href}>
                  <DynamicFeatherIcon
                    iconName="Sun"
                    className={`icon-light iw-13 ih-13 ${
                      storyHasUnseen && !isFakeStory
                        ? "story-unseen-highlight"
                        : ""
                    }`}
                    // onClick={(e: any) => handleIconClick(e)}
                  />
                </a>
                {!isFakeStory && (
                  <div className="dropdown-menu dropdown-menu-right custom-dropdown ">
                    <ul>
                      <li>
                        <a href={Href}>
                          <DynamicFeatherIcon
                            iconName="VolumeX"
                            className="icon-font-light iw-16 ih-16"
                          />
                          {Mute} {story ? story.user.first_name : "josephin"}
                        </a>
                      </li>
                      <li>
                        <a href={Href}>
                          <DynamicFeatherIcon
                            iconName="User"
                            className="icon-font-light iw-16 ih-16"
                          />
                          {ViewProfile}
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
              </ButtonGroup>
            </div>
          </div>
        </div>
      </div>
      {!isFakeStory && (
        <StoriesModal
          showModal={showStoryModal}
          toggle={toggleStoryModal}
          initialUserIndex={initialUserIndex || undefined}
        />
      )}
    </>
  );
};

export default CommonStoryBox;
