import CreatePost from "@/Common/CreatePost";
import { FC } from "react";
import PostPanel from "./PostPanel";

const ContentCenter: FC = () => {
  return (
    <div className="content-center">
      <CreatePost onPostCreated={() => {}} />
      <div className="overlay-bg" />
      <PostPanel />
    </div>
  );
};

export default ContentCenter;
