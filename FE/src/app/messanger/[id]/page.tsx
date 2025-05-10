"use client";
import { useParams } from "next/navigation";
import MessengerSection from "@/components/Messenger";
// import MessengerLayout from "@/layout/MessengerLayout";

export default function MessengerWithId() {
  const { id } = useParams();
  
  const conversationId = id as string;

  return (
    // <MessengerLayout initialConversationId={conversationId}>
      <MessengerSection initialConversationId={conversationId} />
    // </MessengerLayout>
  );
}
