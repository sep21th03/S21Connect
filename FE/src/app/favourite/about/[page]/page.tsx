"use client";
import FavoriteAboutPage from "@/components/Favorite/FavoriteAboutPage";
import React from "react";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const page = params?.page as string;
  return <FavoriteAboutPage page={page} />;
}
