import { useState, useEffect } from "react";
import { Album, Href, Post } from "../../utils/constant/index";
import CreatePostHeader from "./CreatePostHeader";
import { Button, Input } from "reactstrap";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import OptionsInputs from "./OptionsInputs";
import { createPostData } from "@/Data/common";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

const CreatePost = () => {
  const colorList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const [writePost, setWritePost] = useState(false);
  const [showPostButton, setShowPostButton] = useState(false);
  const [postClass, setPostClass] = useState("");
  const [optionInput, setOptionInput] = useState("");
  const [listFriends, setListFriends] = useState([]);
  const [postDropDown, setPostDropDown] = useState(false);
  const [selectedOption, setSelectedOption] = useState("public");
  const [selectedFeeling, setSelectedFeeling] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [selectedBg, setSelectedBg] = useState<string>("");
  const [postContent, setPostContent] = useState("");
  const [tagInput, setTagInput] = useState("");


  const creatPost = async () => {
    const response = await axiosInstance.post(API_ENDPOINTS.POSTS.CREATE_POST, {
      feeling: selectedFeeling,
      checkin: selectedPlace,
      tagfriends: taggedFriends,
      bg_id: selectedBg,
      content: postContent,
      visibility: selectedOption,
    });

    if (response.status === 200) {
      setWritePost(false);
      setShowPostButton(false);
      setPostClass("");
      setOptionInput("");
      setSelectedFeeling("");
      setPostContent("");
      setSelectedPlace(null);
      setTaggedFriends([]);
      setSelectedBg("");
      setSelectedOption("public");
      setTagInput("");
      toast.success(response.data.message);
    } else {
      toast.error("Đăng bài thất bại");
    }
  };

  const handleCreatePost = () => {
    creatPost();
  };

  const { data: session } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    const fetchListFriends = async () => {
      if (userId) {
        const response = await axiosInstance.get(
          API_ENDPOINTS.USERS.BASE + API_ENDPOINTS.USERS.LIST_FRIENDS(userId)
        );
        setListFriends(response.data);
      }
    };
    fetchListFriends();
  }, [userId]);

  const handleShowPost = (value: string) => {
    setWritePost(true);
    setShowPostButton(true);
    setPostClass(value);
    setSelectedBg(value);
  };
  return (
    <div className="create-post">
      <CreatePostHeader
        writePost={writePost}
        setShowPostButton={setShowPostButton}
        postDropDown={postDropDown}
        setPostDropDown={setPostDropDown}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        postContent={postContent}
        setPostContent={setPostContent}
      />
      <div className="create-bg">
        <div className={`bg-post ${postClass} ${writePost ? "d-block" : ""} `}>
          <div className="input-sec">
            <Input
              type="text"
              className="enable"
              placeholder="write something here.."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            <div className="close-icon" onClick={() => setWritePost(false)}>
              <a href={Href}>
                <DynamicFeatherIcon iconName="X" className="iw-20 ih-20" />
              </a>
            </div>
          </div>
        </div>
        <ul className="gradient-bg theme-scrollbar">
          {colorList.map((data, index) => (
            <li
              key={index}
              onClick={() => handleShowPost(`gr-${data}`)}
              className={`gr-${data}`}
            />
          ))}
        </ul>
      </div>
      <OptionsInputs
        OptionsInput={optionInput}
        setOptionInput={setOptionInput}
        listFriends={listFriends}
        setSelectedFeeling={setSelectedFeeling}
        setSelectedPlace={setSelectedPlace}
        setTaggedFriends={setTaggedFriends}
        tagInput={tagInput}
        setTagInput={setTagInput}
      />
      <ul className="create-btm-option">
        <li>
          <Input className="choose-file" type="file" />
          <h5>
            <DynamicFeatherIcon iconName="Camera" className="iw-14" />
            {Album}
          </h5>
        </li>
        {createPostData.map((data, index) => (
          <li key={index} onClick={() => setOptionInput(data.value)}>
            <h5>
              <DynamicFeatherIcon
                iconName={data.icon}
                className={
                  data.tittle === "feelings & acitivity" ? "iw-14" : "iw-15"
                }
              />
              {data.tittle}
            </h5>
          </li>
        ))}
      </ul>
      <div className={`post-btn ${showPostButton ? "d-block" : "d-none"}  `}>
        <Button onClick={handleCreatePost}>{Post}</Button>
      </div>
    </div>
  );
};

export default CreatePost;
