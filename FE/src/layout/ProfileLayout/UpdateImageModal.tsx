import React, { FC, useCallback, useState } from "react";
import { ModalInterFace } from "../LayoutTypes";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Spinner
} from "reactstrap";
import UploadedAlbum from "./UploadedAlbum";
import AlbumTabPane from "./AlbumTabPane";
import { Album, ChoosePhoto, Uploaded } from "../../utils/constant";
import { useSession } from "next-auth/react";
import UserProfileService from "@/service/userProfileService";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setBackgroundImage, setImageLink } from "@/redux-toolkit/reducers/LayoutSlice";

interface UpdateImageModalProps extends ModalInterFace {
  updateBackGround?: (url: string) => void;
  isBackgroundImage?: boolean;
}

const UpdateImageModal: FC<UpdateImageModalProps> = ({ isOpen, toggle, updateBackGround, isBackgroundImage }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [imageUrl, setImageUrl] = useState("post/10.jpg");
  const [idImage, setIdImage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: session } = useSession();
  const userid = session?.user?.id || "defaultUser";
  const dispatch = useDispatch();
  
  const handleImageUrl = useCallback((url: string, id: string) => {
    setImageUrl(url);
    setIdImage(id);
  }, []);

  const handleSubmitValue = async () => {
    if (!imageUrl) return;

    try {
      setIsUpdating(true);
      
      let response;
      if (isBackgroundImage) {
        response = await UserProfileService.updateBackgroundImage(imageUrl, idImage);
        if (response.success) {
          dispatch(setBackgroundImage(response.cover_photo || ""));
          toast.success("Cập nhật ảnh bìa thành công!");
        }
      } else {
        response = await UserProfileService.updateAvatar(imageUrl, idImage);
        if (response.success) {
          dispatch(setImageLink(response.avatar || ""));
          toast.success("Cập nhật ảnh đại diện thành công!");
        }
      }

      if (response.success) {
        updateBackGround?.(imageUrl);
        toggle();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Failed to update image. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTabChange = (tabId: number) => {
    setActiveTab(tabId);
    if (tabId === 1) {
      setImageUrl("post/10.jpg");
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      toggle={toggle} 
      centered 
      modalClassName="mobile-full-width" 
      className="Choose-photo-modal modal-custom-lg"
    >
      <ModalHeader toggle={toggle}>
        {isBackgroundImage ? "Chọn ảnh bìa" : ChoosePhoto}
      </ModalHeader>
      <ModalBody>
        <Nav tabs>
          <NavItem>
            <NavLink 
              className={activeTab === 1 ? "active" : ""} 
              onClick={() => handleTabChange(1)}
              style={{ cursor: 'pointer' }}
            >
              {Uploaded}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink 
              className={activeTab === 2 ? "active" : ""} 
              onClick={() => handleTabChange(2)}
              style={{ cursor: 'pointer' }}
            >
              {Album}
            </NavLink>
          </NavItem>
        </Nav>
        
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1} className="Choose-photo-modal">
            <UploadedAlbum handleImageUrl={handleImageUrl} userid={userid} />
          </TabPane>
          <TabPane tabId={2}>
            <AlbumTabPane handleImageUrl={handleImageUrl} userid={userid} />
          </TabPane>
        </TabContent>
      </ModalBody>
      
      <ModalFooter>
        <Button 
          color="secondary" 
          onClick={toggle}
          disabled={isUpdating}
        >
          Cancel
        </Button>
        <Button 
          color="primary" 
          onClick={handleSubmitValue}
          disabled={isUpdating || !imageUrl}
        >
          {isUpdating ? (
            <>
              <Spinner size="sm" className="me-2" />
              Đang cập nhật...
            </>
          ) : (
            isBackgroundImage ? "Cập nhật ảnh bìa" : ChoosePhoto
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UpdateImageModal;