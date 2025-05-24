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

interface CommonStoryBoxProps extends OverlayNames {
  story?: Story;
  hasUnseen?: boolean;
}

const CommonStoryBox: FC<CommonStoryBoxProps> = ({
  story,
  hasUnseen = false,
}) => {
  const [showStoryModal, setShowStoryModal] = useState(false);
  const toggleStoryModal = () => setShowStoryModal(!showStoryModal);
  const [initialUserIndex , setInitialUserIndex ] = useState<string | null>(null);

  const storyHasUnseen = story
  ? !story.is_mine && story.items.some((item) => !item.is_seen)
  : hasUnseen;

  const handleSelectedStory = () => {
    setInitialUserIndex(story?.id || null);
    toggleStoryModal();
  };

  return (
    <>
      <div onClick={handleSelectedStory}>
        <div>
          <div
            className={`story-box ${storyHasUnseen ? "unseen-highlight" : ""}`}
            style={
              storyHasUnseen
                ? {
                    border: "2px solid #007bff",
                    boxShadow: "0 0 8px rgba(0, 123, 255, 0.6)",
                    transition: "box-shadow 0.3s ease, border 0.3s ease",
                  }
                : {}
            }
          >
            {/* <div className={`adaptive-overlay ${color ? `${color}-overlay` : ""}`}/> */}
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
              {/* <span>active now</span> */}
            </div>
            <div className="story-setting setting-dropdown">
              <ButtonGroup className="custom-dropdown arrow-none dropdown-sm">
                <a href={Href}>
                  <DynamicFeatherIcon
                    iconName="Sun"
                    className={`icon-light iw-13 ih-13 ${
                      storyHasUnseen ? "story-unseen-highlight" : ""
                    }`}
                    onClick={handleSelectedStory}
                  />
                </a>
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
              </ButtonGroup>
            </div>
          </div>
        </div>
      </div>
      <StoriesModal showModal={showStoryModal} toggle={toggleStoryModal} initialUserIndex={initialUserIndex} />
    </>
  );
};

export default CommonStoryBox;
