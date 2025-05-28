"use client";
import { FC, useEffect, useState } from "react";
import NewStories from "./NewStories";
import CommonStoryBox from "./common/CommonStoryBox";
import { overlayName } from "@/Data/NewsFeed";
import { storySliderOption } from "@/Data/SliderOptions";
import Slider from "react-slick";
import { StorySectionProps } from "../Style1Types";
import { getStories } from "@/service/storiesService";
import { Story } from "@/Common/CommonInterFace";

const StorySection: FC<StorySectionProps> = ({ storyShow = 8 }) => {
  const [stories, setStories] = useState<Story[]>([]);
  useEffect(() => {
    getStories().then((data) => {
      const storiesData = data.stories || data;
      const sortedStories = [
        ...storiesData.filter((s: Story) => s.is_mine),
        ...storiesData.filter((s: Story) => !s.is_mine),
      ];
      setStories(sortedStories);
    });
  }, []);
  return (
    <div className="story-section ratio_115">
      <Slider
        {...storySliderOption(storyShow)}
        className="slide-8 no-arrow default-space"
      >
        <div>
          <NewStories />
        </div>
        {stories.map((data, index) => (
          <div key={index}>
            <CommonStoryBox
              key={index}
              story={data}
              hasUnseen={data.items.some((item) => !item.is_seen)}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default StorySection;
