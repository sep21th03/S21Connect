"use client";
import { useParams, usePathname } from "next/navigation";
import MessengerSection from "@/components/Messenger";
import MessengerLayout from "@/layout/MessengerLayout";

export default function MessengerWithId() {
  const params = useParams();
  const pathname = usePathname();
  
  console.log("params:", params);  // Kiểm tra nếu params có id không
  console.log("pathname:", pathname);  // Kiểm tra pathname

  const conversationId = params.id;

  return (
    <MessengerLayout initialConversationId={conversationId}>
      <MessengerSection initialConversationId={conversationId} />
    </MessengerLayout>
  );
}
