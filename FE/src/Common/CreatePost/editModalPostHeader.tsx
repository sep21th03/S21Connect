import { useState } from "react"; 
import EditPostModal from "@/Common/CreatePost/EditPostModal"; 
import { postDropDownOptionInterface, Post } from "@/components/NewsFeed/Style1/Style1Types";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { DropdownMenu } from "reactstrap";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { toast } from "react-toastify";
import ReportModal from "./ReportModal";

interface Reason {
  reason_code: string;
  reason_text: string;
}


const EditModalPostHeader = ({ postUser, onPostUpdated, onPostDeleted }: { postUser: Post, onPostUpdated: (updatedPost: Post) => void, onPostDeleted: () => void }) => {
  const [editModal, setEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showOption, setShowOption] = useState(postUser?.visibility);
  const [deleteModal, setDeleteModal] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [selectReasons, setSelectReasons] = useState<Reason[]>([]);

  const toggleEditModal = () => setEditModal(!editModal);
  const toggleDeleteModal = () => setDeleteModal(!deleteModal);

  const toggleReportModal = async () => {
    if (!reportModal) { 
      try {
        const res = await axiosInstance.get(API_ENDPOINTS.REPORTS.GET_REASONS("Post"));
        setSelectReasons(res.data);
        setReportModal(true);
      } catch (error) {
        console.error("Lỗi khi lấy lý do báo cáo:", error);
      }
    } else {
      setReportModal(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axiosInstance.post(API_ENDPOINTS.POSTS.DELETE_POST(postUser.post_id));

      if (res.status === 200) {
        toggleDeleteModal();
        onPostDeleted?.();
        toast.success("Bài viết đã được xóa thành công");
      } else {
        console.error("Xóa thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    }
  };

  const handleReport = async ({reason_code, reason_text}: {reason_code: string, reason_text: string}) => {
    try {
      const res = await axiosInstance.post(API_ENDPOINTS.REPORTS.POST("Post", postUser.id.toString()), {
        reason_code: reason_code,
        reason_text: reason_text,
      });
      if (res.status === 200) {
        toggleReportModal();
        toast.success(res.data.message);
      } else {
        console.error("Báo cáo thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi báo cáo:", error);
    }
  };

  const postDropDownOption: postDropDownOptionInterface[] = [
    {
      iconName: "Bookmark",
      post: "Lưu bài viết",
      onClick: () => console.log("save post"),
    },
    {
      iconName: "XSquare",
      post: "Ẩn bài viết",
      onClick: () => console.log("hide post"),
    },
    {
      iconName: "AlertCircle",
      post: "Báo cáo bài viết",
      onClick: () => toggleReportModal(),
    },
    {
      iconName: "Edit",
      post: "Chỉnh sửa bài viết",
      onClick: (post: Post) => {
        setSelectedPost(post);
        setEditModal(true);
      },
    },
    {
      iconName: "X",
      post: "Xóa bài viết",
      onClick: () => {
        toggleDeleteModal();
      },
    },
  ];

  return (
    <>
      <DropdownMenu>
        <ul>
          {postDropDownOption.map((data, index) => (
            <li key={index}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  data.onClick?.(postUser); 
                }}
              >
                <DynamicFeatherIcon iconName={data.iconName} className="icon icon-font-color iw-14" />
                {data.post}
              </a>
            </li>
          ))}
        </ul>
      </DropdownMenu>

      <EditPostModal showModal={editModal} toggleModal={toggleEditModal} post={selectedPost} setShowOption={setShowOption} showOption={showOption} onPostUpdated={onPostUpdated}/>
          
      <ConfirmDeleteModal
        isOpen={deleteModal}
        toggle={toggleDeleteModal}
        onConfirm={handleDelete}
      />

      <ReportModal
        isOpen={reportModal}
        toggle={toggleReportModal}
        onSubmit={handleReport}
        reasons={selectReasons}
      />
    </>
  );
};

export default EditModalPostHeader;
