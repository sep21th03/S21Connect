import UserProFile from "@/Common/UserProFile";
import FriendSuggestion from "../Style1/LeftContent/FriendSuggestion";
import LikePage from "../Style1/LeftContent/LikePage";
import WeatherSection from "../Style1/LeftContent/WeatherSection";
import LikedPages from "../Style1/LeftContent/LikedPages";

const LeftContent = ({padding}:{padding?:boolean}) => {
  return (
    <div className={`content-left ${!padding ?"p-0":""}`}>
      <UserProFile userProfile={null as any} />
      <FriendSuggestion />
      <div className="sticky-top">
      <LikedPages />  
      <WeatherSection />
    </div>
    </div>
  );
};

export default LeftContent;
