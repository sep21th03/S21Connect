import { useState } from "react";
import { Camera, Video, Href, Post } from "../../utils/constant/index";
import CreatePostHeader from "./CreatePostHeader";
import { Button, Input } from "reactstrap";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { toast } from "react-toastify";
import styles from "../../style/newsFeed.module.css";
import { uploadFilesToCloudinary } from "@/service/cloudinaryService";
import { createPagePost } from "@/service/postService";

interface CreatePagePostProps {
  pageId: string;
  onPostCreated: () => void;
}

const CreatePagePost = ({ pageId, onPostCreated }: CreatePagePostProps) => {
  const colorList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const [writePost, setWritePost] = useState(false);
  const [showPostButton, setShowPostButton] = useState(false);
  const [postClass, setPostClass] = useState("");
  const [selectedBg, setSelectedBg] = useState<string>("");
  const [postContent, setPostContent] = useState("");
  
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const validFiles = newFiles.filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("video/")
      );

      if (validFiles.length !== newFiles.length) {
        toast.warning("Chỉ chấp nhận file ảnh và video!");
      }

      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const removeAllFiles = () => {
    setSelectedFiles([]);
  };

  const createPostHandler = async () => {
    let media: { url: string; public_id: string; type: "image" | "video" }[] = [];
    
    if (selectedFiles.length > 0) {
      setUploadingFiles(true);
      try {
        const uploadResult = await uploadFilesToCloudinary(selectedFiles);
        media = uploadResult.files.map(file => ({
          url: file.url,
          public_id: file.public_id,
          type: file.resource_type === "image" ? "image" : "video",
        }));
      } catch (error) {
        toast.error("Upload file thất bại!");
        setUploadingFiles(false);
        return;
      }
      setUploadingFiles(false);
    }

    try {
      const response = await createPagePost(
        pageId,
        undefined, 
        undefined,
        undefined,
        selectedBg,
        postContent,
        "public", 
        media
      );
      
      if (response.status === 200) {
        setWritePost(false);
        setShowPostButton(false);
        setPostClass("");
        setPostContent("");
        setSelectedBg("");
        setSelectedFiles([]);
        setShowMediaUpload(false);
        toast.success(response.data.message);
        onPostCreated();
      } else {
        toast.error("Đăng bài thất bại");
      }
    } catch (error) {
      toast.error("Đăng bài thất bại");
    }
  };

  const handleCreatePost = () => {
    createPostHandler();
  };

  const handleShowPost = (value: string) => {
    setWritePost(true);
    setShowPostButton(true);
    setPostClass(value);
    setSelectedBg(value);
  };

  const handleCameraClick = () => {
    setShowMediaUpload(!showMediaUpload);
  };

  return (
    <div className="create-post">
      <CreatePostHeader
        writePost={writePost}
        setShowPostButton={setShowPostButton}
        postDropDown={false}
        setPostDropDown={() => {}}
        selectedOption="public"
        setSelectedOption={() => {}} 
        postContent={postContent}
        setPostContent={setPostContent}
        isPagePost={true}
      />
      
      <div className="create-bg">
        <div className={`bg-post ${postClass} ${writePost ? "d-block" : ""} `}>
          <div className="input-sec">
            <Input
              type="text"
              className="enable"
              placeholder="Trang của bạn muốn chia sẻ điều gì..."
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
            showMediaUpload ? "d-block" : "d-none"
          }`}
        >
          <div
            className={`${styles.uploadInputWrapper} dropzone`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files).filter(
                (file) =>
                  file.type.startsWith("image/") ||
                  file.type.startsWith("video/")
              );
              setSelectedFiles((prev) => [...prev, ...files]);
            }}
            onClick={() =>
              document.getElementById("hidden-file-input-page")?.click()
            }
          >
            <input
              id="hidden-file-input-page"
              type="file"
              multiple
              accept="image/*, video/*"
              onChange={handleFileSelect}
              disabled={uploadingFiles}
              className="d-none"
            />
            <div className={styles.dropzoneContent}>
              <DynamicFeatherIcon iconName="Image" className="icon" />
              <p>Kéo thả ảnh vào đây hoặc click để chọn ảnh</p>
            </div>
            {uploadingFiles && (
              <div className={styles.uploadingIndicator}>
                <span>Đang upload ảnh...</span>
              </div>
            )}
          </div>

          {selectedFiles.length > 0 && (
            <div className={styles.selectedImagesPreview}>
              <div
                className={styles.removeImageBtn}
                onClick={() => removeAllFiles()}
              >
                <DynamicFeatherIcon iconName="X" className="iw-20 ih-20" />
              </div>
              <div
                className={`${styles.imagePreviewGrid} ${
                  styles[
                    `grid${
                      selectedFiles.length >= 5 ? "5plus" : selectedFiles.length
                    }`
                  ]
                }`}
              >
                {selectedFiles.slice(0, 4).map((file, index) => {
                  const areaClass = ["a", "b", "c", "d"][index];
                  const isImage = file.type.startsWith("image/");
                  const isVideo = file.type.startsWith("video/");
                  return (
                    <div
                      key={index}
                      className={`${styles.imageItem} ${styles[areaClass]}`}
                    >
                      {isImage && (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                        />
                      )}
                      {isVideo && (
                        <video
                          controls
                          src={URL.createObjectURL(file)}
                          style={{ width: "100%", height: "100%" }}
                        />
                      )}
                    </div>
                  );
                })}

                {selectedFiles.length > 4 && (
                  <div className={`${styles.imageItem} ${styles.e}`}>
                    <img
                      src={URL.createObjectURL(selectedFiles[4])}
                      alt="Preview 5"
                    />
                    <div className={styles.imageOverlay}>
                      +{selectedFiles.length - 4}
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

      <ul className="create-btm-option">
        <li onClick={handleCameraClick}>
          <h5>
            <DynamicFeatherIcon iconName="Camera" className="iw-14" />
            {Camera}/{Video}
          </h5>
        </li>
      </ul>

      <div className={`post-btn ${showPostButton ? "d-block" : "d-none"}  `}>
        <Button onClick={handleCreatePost} disabled={uploadingFiles}>
          {uploadingFiles ? "Đang đăng bài..." : Post}
        </Button>
      </div>
    </div>
  );
};

export default CreatePagePost;