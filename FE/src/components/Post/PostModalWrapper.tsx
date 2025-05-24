"use client";

import PostModal from "./PostModal";
import { useModalNavigation } from "@/hooks/useModalNavigation";

export default function PostModalWrapper() {
  const { isModalOpen, closeModal } = useModalNavigation();

  if (!isModalOpen) {
    return null;
  }

  return <PostModal onClose={closeModal} />;
}