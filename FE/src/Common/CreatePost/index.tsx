import { useState, useEffect } from "react";
import { Camera, Video, Href, Post } from "../../utils/constant/index";
import CreatePostHeader from "./CreatePostHeader";
import { Button, Input } from "reactstrap";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import OptionsInputs from "./OptionsInputs";
import { createPostData } from "@/Data/common";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import styles from "../../style/newsFeed.module.css";

const CreatePost = ({ onPostCreated }: { onPostCreated: () => void }) => {
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
  const [selectedTag, setSelectedTag] = useState<string>("");

  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Image = event.target?.result as string;
          const formData = new FormData();
          formData.append("file", base64Image);
          formData.append("upload_preset", "upload_preset");
          formData.append("folder", "message/image");

          const response = await fetch(
            "https://api.cloudinary.com/v1_1/dyksxiq0e/image/upload",
            {
              method: "POST",
              body: formData,
            }
          );

          const data = await response.json();
          if (data.secure_url) {
            resolve(data.secure_url);
          } else {
            reject(new Error("Upload failed"));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setSelectedImages((prev) => [...prev, ...newFiles]);
    }
  };

  const removeImage = () => {
    setSelectedImages([]);
  };

  const creatPost = async () => {
    let imageUrls: string[] = [];

    if (selectedImages.length > 0) {
      setUploadingImages(true);
      try {
        const uploadPromises = selectedImages.map((file) =>
          uploadImageToCloudinary(file)
        );
        imageUrls = await Promise.all(uploadPromises);
        toast.success("Upload ảnh thành công!");
      } catch (error) {
        toast.error("Upload ảnh thất bại!");
        console.error("Upload error:", error);
        setUploadingImages(false);
        return;
      }
      setUploadingImages(false);
    }

    const response = await axiosInstance.post(API_ENDPOINTS.POSTS.CREATE_POST, {
      feeling: selectedFeeling,
      checkin: selectedPlace,
      tagfriends: taggedFriends,
      bg_id: selectedBg,
      content: postContent,
      visibility: selectedOption,
      images: imageUrls,
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
      setSelectedImages([]);
      setShowImageUpload(false);
      toast.success(response.data.message);
    } else {
      toast.error("Đăng bài thất bại");
    }
    onPostCreated();
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
    if (selectedTag === "friends") {
      fetchListFriends();
    }
  }, [userId, selectedTag]);

  const handleShowPost = (value: string) => {
    setWritePost(true);
    setShowPostButton(true);
    setPostClass(value);
    setSelectedBg(value);
  };

  const handleTagClick = (value: string) => {
    setOptionInput(value);
    setSelectedTag(value);
  };

  const handleCameraClick = () => {
    setShowImageUpload(!showImageUpload);
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
              placeholder="Bạn đang nghĩ gì..."
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

        <div
          className={`image-upload-section ${
            showImageUpload ? "d-block" : "d-none"
          }`}
        >
          <div
            className={`${styles.uploadInputWrapper} dropzone`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files).filter((file) =>
                file.type.startsWith("image/")
              );
              setSelectedImages((prev) => [...prev, ...files]);
            }}
            onClick={() =>
              document.getElementById("hidden-file-input")?.click()
            }
          >
            <input
              id="hidden-file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              disabled={uploadingImages}
              className="d-none"
            />
            <div className={styles.dropzoneContent}>
              <DynamicFeatherIcon iconName="Image" className="icon" />
              <p>Kéo thả ảnh vào đây hoặc click để chọn ảnh</p>
            </div>
            {uploadingImages && (
              <div className={styles.uploadingIndicator}>
                <span>Đang upload ảnh...</span>
              </div>
            )}
          </div>

          {selectedImages.length > 0 && (
            <div className={styles.selectedImagesPreview}>
              <div 
                className={styles.removeImageBtn}
                onClick={() => removeImage()}
              >
                <DynamicFeatherIcon iconName="X" className="iw-20 ih-20" />
              </div>
              <div
                className={`${styles.imagePreviewGrid} ${
                  styles[
                    `grid${
                      selectedImages.length >= 5
                        ? "5plus"
                        : selectedImages.length
                    }`
                  ]
                }`}
              >
                {selectedImages.slice(0, 4).map((file, index) => {
                  const areaClass = ["a", "b", "c", "d"][index];
                  return (
                    <div
                      key={index}
                      className={`${styles.imageItem} ${styles[areaClass]}`}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                      />
                    </div>
                  );
                })}

                {/* Overlay ảnh thứ 5 nếu có */}
                {selectedImages.length > 4 && (
                  <div className={`${styles.imageItem} ${styles.e}`}>
                    <img
                      src={URL.createObjectURL(selectedImages[4])}
                      alt="Preview 5"
                    />
                    <div className={styles.imageOverlay}>
                      +{selectedImages.length - 4}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
        <li onClick={handleCameraClick}>
          <h5>
            <DynamicFeatherIcon iconName="Camera" className="iw-14" />
            {Camera}/{Video}
          </h5>
        </li>
        {createPostData.map((data, index) => (
          <li key={index} onClick={() => handleTagClick(data.value)}>
            <h5>
              <DynamicFeatherIcon
                iconName={data.icon}
                className={
                  data.tittle === "Cảm xúc & hoạt động" ? "iw-14" : "iw-15"
                }
              />
              {data.tittle}
            </h5>
          </li>
        ))}
      </ul>
      <div className={`post-btn ${showPostButton ? "d-block" : "d-none"}  `}>
        <Button onClick={handleCreatePost} disabled={uploadingImages}>
          {uploadingImages ? "Đang đăng bài..." : Post}
        </Button>
      </div>
    </div>
  );
};

export default CreatePost;
