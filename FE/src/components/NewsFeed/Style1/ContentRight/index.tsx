import { FC } from "react";
import BirthdayReminder from "./BirthdayReminder";
import Gallery from "./Gallery";
import EventsCard from "./EventsCard";
import YourGames from "./YourGames";
import { UserInforBirthday } from "@/utils/interfaces/user";

const ContentRight: FC<{ userInforBirthday: UserInforBirthday | null }> = ({ userInforBirthday }) => {
  return (
    <div className="content-right">
      {userInforBirthday && <BirthdayReminder userInforBirthday={userInforBirthday}/>}
      <Gallery />
      <div className="sticky-top">
        <EventsCard eventImage={1} />
        {/* <YourGames /> */}
      </div>
    </div>
  );
};

export default ContentRight;
