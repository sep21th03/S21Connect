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
import StoriesModal from "@/Common/StoriesModal";

const StorySection: FC<StorySectionProps> = ({ storyShow = 8 }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [showStoriesModal, setShowStoriesModal] = useState(false);

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

  const createFakeStories = () => {
    const fakeStories: any[] = [];
    const fakeUsers = [
      { name: "John Doe", avatar: "" },
      { name: "Jane Smith", avatar: "" },
      { name: "Mike Johnson", avatar: "" },
      { name: "Sarah Wilson", avatar: "" },
      { name: "David Brown", avatar: "" },
      { name: "Lisa Davis", avatar: "" },
      { name: "Lisa Davis", avatar: "" },
    ];

    for (let i = 0; i < Math.min(8, Math.max(0, 7 - stories.length)); i++) {
      const fakeUser = fakeUsers[i];
      fakeStories.push({
        id: `fake-${i}`,
        user: {
          first_name: fakeUser.name.split(' ')[0],
          last_name: fakeUser.name.split(' ')[1] || '',
          avatar: fakeUser.avatar,
          username: fakeUser.name.toLowerCase().replace(' ', '_'),
        },
        items: [
          {
            id: `fake-item-${i}`,
            type: 'image',
            file_url: `/assets/images/story/story-${(i % 6) + 1}.jpg`,
            text: '',
            is_seen: Math.random() > 0.5, 
            created_at: new Date(Date.now() - Math.random() * 86400000).toISOString(), 
          }
        ],
        is_mine: false,
        created_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      });
    }
    return fakeStories;
  };

  const allStories = stories.length < 5 ? [...stories, ...createFakeStories()] : stories;

  const handleNewStoriesClick = () => {
    setShowStoriesModal(true);
  };

  const toggleStoriesModal = () => {
    setShowStoriesModal(!showStoriesModal);
  };

  return (
    <>
      <div className="story-section ratio_115">
        <Slider
          {...storySliderOption(storyShow)}
          className="slide-8 no-arrow default-space"
        >
          <div>
            <NewStories onClick={handleNewStoriesClick} />
          </div>
          {allStories.map((data, index) => (
            <div key={data.id || index}>
              <CommonStoryBox
                story={data}
                hasUnseen={data.items.some((item: any) => !item.is_seen)}
                onClick={data.id?.startsWith('fake-') ? handleNewStoriesClick : undefined}
                isFakeStory={data.id?.startsWith('fake-')}
              />
            </div>
          ))}
        </Slider>
      </div>

      <StoriesModal 
        showModal={showStoriesModal} 
        toggle={toggleStoriesModal} 
        initialUserIndex={undefined}
      />
    </>
  );
};

export default StorySection;