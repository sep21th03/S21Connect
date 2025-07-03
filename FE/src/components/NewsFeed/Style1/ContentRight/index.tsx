import { FC } from "react";
import BirthdayReminder from "./BirthdayReminder";
import Gallery from "./Gallery";
import EventsCard from "./EventsCard";
import YourGames from "./YourGames";
import { UserInforBirthday } from "@/components/NewsFeed/Style1/Style1Types";

const ContentRight: FC<{ userInforBirthday: UserInforBirthday[] | null }> = ({ userInforBirthday }) => {
  return (
    <div className="content-right">
      {userInforBirthday && userInforBirthday.length > 1 && <BirthdayReminder userInforBirthday={userInforBirthday}/>}
      <Gallery />
      <div className="sticky-top">
        <EventsCard eventImage={1} />
        {/* <YourGames /> */}
      </div>
    </div>
  );
};

export default ContentRight;
