"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const page = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/newsfeed/style2");
  }, [router]);
  return (
    <main></main>
  )
}

export default page