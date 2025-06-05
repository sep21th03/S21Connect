import React, { FC, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { ModalUserInterFace } from "../LayoutTypes";
import { EditProfile, ImagePath, Href, EditProfileImage } from "../../utils/constant/index";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import EditProfileDetails from "./EditProfileDetails";
import UpdateImageModal from "./UpdateImageModal";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux-toolkit/store";
import CustomImage from "@/Common/CustomImage";
import { FullUserProfile } from "@/utils/interfaces/user";  
import UserProfileService from "@/service/userProfileService";
import { setImageLink } from "@/redux-toolkit/reducers/LayoutSlice";
import { toast } from "react-toastify";
import Image from "next/image";

interface EditCoverModalProps extends ModalUserInterFace {
  userProfile: FullUserProfile;
  onUpdateProfile: (updatedUserProfile: FullUserProfile) => void;
}

const EditCoverModal: FC<EditCoverModalProps> = ({ 
  isOpen, 
  toggle, 
  userProfile, 
  onUpdateProfile 
}) => {
  const [updateImage, setUpdateImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState<FullUserProfile>(userProfile);
  const dispatch = useDispatch();
  
  const updateToggleImage = () => {setUpdateImage(!updateImage)};
  
  const handleEdit = () => {
    toggle();
    updateToggleImage();
  };
  
  const handleProfileDetailsUpdate = (newProfileData: FullUserProfile) => {
    setUpdatedProfile(newProfileData);
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const response = await UserProfileService.updateProfile(updatedProfile.profile);
      
      if (response.success) {
        onUpdateProfile(updatedProfile);
        toggle();
        toast.success("Cập nhật thông tin thành công!");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    dispatch(setImageLink(newAvatarUrl));
    
    setUpdatedProfile(prev => ({
      ...prev,
      user: {
        ...prev.user,
        avatar: newAvatarUrl
      }
    }));
  };
  
  const { imageLink } = useSelector((state: RootState) => state.LayoutSlice);

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>{EditProfile}</ModalHeader>
        <ModalBody>
          <div className="edit-profile-sec">
            <div className="profile-wrap">
              <div className="edit-title">
                <div className="icon">
                  <DynamicFeatherIcon iconName="Image" className="iw-16 ih-16"/>
                </div>
                <h5>{EditProfileImage}</h5>
              </div>
              <div className="edit-content">
                <div className="profile-pic">
                  <div className="bg-size blur-up lazyloaded">
                    <Image
                      src={updatedProfile?.user?.avatar ? updatedProfile.user.avatar : `${ImagePath}/${imageLink}`}
                      className="img-fluid lazyload bg-img rounded-circle"
                      alt=""
                      width={100}
                      height={100}
                    />
                  </div>
                  <a href={Href} onClick={handleEdit}>
                    Thay ảnh đại diện
                  </a>
                </div>
              </div>
            </div>
            <EditProfileDetails 
              userProfile={updatedProfile} 
              onUpdateProfile={handleProfileDetailsUpdate}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="solid" onClick={handleSaveChanges} disabled={isLoading}>
            {isLoading ? "Đang cập nhật..." : "Lưu thay đổi"}
          </Button>
        </ModalFooter>
      </Modal>
      <UpdateImageModal 
        isOpen={updateImage} 
        toggle={updateToggleImage} 
        updateBackGround={handleAvatarUpdate}
        isBackgroundImage={false}
      />
    </>
  );
};

export default EditCoverModal;