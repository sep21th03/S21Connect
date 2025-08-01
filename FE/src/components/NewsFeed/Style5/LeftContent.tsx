import UserProFile from "@/Common/UserProFile";
import React, { FC } from "react";
import BirthdayReminder from "../Style1/ContentRight/BirthdayReminder";
import Gallery from "../Style1/ContentRight/Gallery";
import LikePage from "../Style1/LeftContent/LikePage";
import EventsCard from "../Style1/ContentRight/EventsCard";
import WeatherSection from "../Style1/LeftContent/WeatherSection";
import LikedPages from "../Style1/LeftContent/LikedPages";

const LeftContent: FC = () => {
  return (
    <div className="content-left">
      <UserProFile userProfile={null as any} />
      <BirthdayReminder userInforBirthday={null as any} />
      <Gallery />
      <LikedPages />
      <div className="sticky-top">
        <EventsCard eventImage={1} />
        <WeatherSection />
      </div>
    </div>
  );
};

export default LeftContent;
