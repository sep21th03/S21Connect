import { FC, useEffect, useState } from "react";
import FriendSuggestionHeader from "./FriendSuggestionHeader";
import { ActiveNow, ImagePath } from "../../../../utils/constant";
import { friendSuggestionSlider } from "@/Data/NewsFeed";
import { FriendSuggestionInterFace } from "../Style1Types";
import Slider from "react-slick";
import { friendSuggestionSliderOption } from "@/Data/SliderOptions";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";


const FriendSuggestion: FC<FriendSuggestionInterFace> = ({ mainClassName }) => {

  const [friendSuggestion, setFriendSuggestion] = useState<any[]>([]);

  useEffect(() => {
    axiosInstance.get(API_ENDPOINTS.USERS.FRIEND_SUGGESTION).then((res) => {
      setFriendSuggestion(res.data);
    });
  }, []);
  return (
    <div
      className={`suggestion-box section-t-space ${
        mainClassName ? mainClassName : ""
      }`}
    >
      <FriendSuggestionHeader />
      <div className="suggestion-content ratio_115">
        <Slider {...friendSuggestionSliderOption} className="slide-2 default-space">
          {friendSuggestion.map((data, index) => (
            <div key={index}>
              <div className="story-box">
                <div className={`adaptive-overlay ${data?.className}-overlay`} />
                <div
                  className="story-bg bg-size"
                  style={{
                    backgroundImage: `url("${data?.avatar}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat",
                    display: "block",
                  }}
                />
                <div className="story-content">
                  <h6>{data?.first_name} {data?.last_name}</h6>
                  <span>{data?.mutual_count} Bạn chung</span>  
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default FriendSuggestion;
