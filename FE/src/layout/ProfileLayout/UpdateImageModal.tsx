import React, { FC, useCallback, useState } from "react";
import { ModalInterFace } from "../LayoutTypes";
import {Button,Modal,ModalBody,ModalFooter,ModalHeader,Nav,NavItem,NavLink,TabContent,TabPane} from "reactstrap";
import UploadedAlbum from "./UploadedAlbum";
import AlbumTabPane from "./AlbumTabPane";
import { Album, ChoosePhoto, Uploaded } from "../../utils/constant";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { useSession } from "next-auth/react";


const UpdateImageModal: FC<ModalInterFace> = ({ isOpen, toggle,updateBackGround }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [imageUrl, setImageUrl] = useState("post/10.jpg");
  const { data: session } = useSession();
  const userid = session?.user?.id || "defaultUser";

  const handleImageUrl = useCallback((tab: string) => {
    setImageUrl(tab);
  }, []);
  const handleSubmitValue = () => {
    const updateAvatar = async () => {
      try {
        const response = await axiosInstance.post(API_ENDPOINTS.PROFILE.USER_AVATAR, {
          avatar: imageUrl,
        });
        if (response.data.success) {
          updateBackGround?.(imageUrl);
          toggle();
          window.location.reload();
        } else {
          console.error("Error updating avatar:", response.data.message);
        }
      }
      catch (error) {
        console.error("Error updating avatar:", error);
      }
    };
    updateAvatar();
    toggle();
  };

  


  return (
    <Modal isOpen={isOpen} toggle={toggle} centered modalClassName="mobile-full-width" className="Choose-photo-modal modal-custom-lg">
      <ModalHeader toggle={toggle}>{ChoosePhoto}</ModalHeader>
      <ModalBody>
        <Nav tabs>
          <NavItem>
            <NavLink className={activeTab === 1 ? "active" : ""} onClick={() => setActiveTab(1)}>
              {Uploaded}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink className={activeTab === 2 ? "active" : ""} onClick={() => setActiveTab(2)}>
              {Album}
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId={1} className="Choose-photo-modal">
            <UploadedAlbum handleImageUrl={handleImageUrl} userid={userid}/>
          </TabPane>
          <TabPane tabId={2}>
            <AlbumTabPane handleImageUrl={handleImageUrl} userid={userid}/>
          </TabPane>
        </TabContent>
      </ModalBody>
      <ModalFooter>
        <Button color="solid" onClick={handleSubmitValue}>
          {ChoosePhoto}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default UpdateImageModal;
