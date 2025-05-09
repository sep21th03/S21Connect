"use client";
import MessengerSection from "@/components/Messenger";
import MessengerLayout from "@/layout/MessengerLayout";
import { FC } from "react";

const Messenger: FC = () => {
  return (
    <MessengerLayout>
      <MessengerSection />
    </MessengerLayout>
  );
};

export default Messenger;