import React, { FC, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { ModalUserInterFace } from "../LayoutTypes";
import { EditProfile, ImagePath, Href, EditProfileImage } from "../../utils/constant/index";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import EditProfileDetails from "./EditProfileDetails";
import UpdateImageModal from "./UpdateImageModal";
import { useSelector } from "react-redux";
import { RootState } from "@/redux-toolkit/store";
import CustomImage from "@/Common/CustomImage";
import { FullUserProfile } from "@/utils/interfaces/user";  
import {API_ENDPOINTS} from "@/utils/constant/api";
import axiosInstance from "@/utils/axiosInstance";

interface EditCoverModalProps extends ModalUserInterFace {
  userProfile: FullUserProfile;
  onUpdateProfile: (updatedUserProfile: FullUserProfile) => void;
}

const EditCoverModal: FC<EditCoverModalProps> = ({ isOpen, toggle, userProfile, onUpdateProfile }) => {
  const [updateImage, setUpdateImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState<FullUserProfile>(userProfile);
  
  const updateToggleImage = () => {setUpdateImage(!updateImage)};
  
  const handleEdit = () => {
    toggle();
    updateToggleImage();
  };
  
  const handleProfileDetailsUpdate = (newProfileData: FullUserProfile) => {
    setUpdatedProfile(newProfileData);
  };
  const prepareProfilePayload = (profile: typeof updatedProfile.profile) => ({
    ...profile,
    is_phone_number_visible: profile.is_phone_number_visible ? 1 : 0,
    is_location_visible: profile.is_location_visible ? 1 : 0,
    is_workplace_visible: profile.is_workplace_visible ? 1 : 0,
    is_school_visible: profile.is_school_visible ? 1 : 0,
    is_past_school_visible: profile.is_past_school_visible ? 1 : 0,
    is_relationship_status_visible: profile.is_relationship_status_visible ? 1 : 0,
  });
  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.PROFILE.BASE + API_ENDPOINTS.PROFILE.MY_PROFILE.UPDATE, {
        profile: prepareProfilePayload(updatedProfile.profile),
      });
      if (response.data) {
        onUpdateProfile(updatedProfile);
        toggle();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
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
                    <CustomImage
                      src={`${ImagePath}/${imageLink}`}
                      className="img-fluid blur-up lazyload bg-img"
                      alt=""
                    />
                  </div>
                  <a href={Href} onClick={handleEdit}>
                    edit image
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
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </ModalFooter>
      </Modal>
      <UpdateImageModal isOpen={updateImage} toggle={updateToggleImage} />
    </>
  );
};

export default EditCoverModal;