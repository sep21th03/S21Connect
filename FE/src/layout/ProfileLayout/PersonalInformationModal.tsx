import React, { FC, useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { ModalUserInterFace } from "../LayoutTypes";
import { EditProfile } from "../../utils/constant/index";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import dayjs from "dayjs";
import { API_ENDPOINTS } from "@/utils/constant/api";
import axiosInstance from "@/utils/axiosInstance";
import { FullUserProfile } from "@/utils/interfaces/user";

interface PersonalInformationModalProps extends ModalUserInterFace {
  onUpdateProfile: (updatedUserProfile: FullUserProfile) => void;
}

const PersonalInformationModal: FC<PersonalInformationModalProps> = ({
  isOpen,
  toggle,
  userProfile,
  onUpdateProfile,
}) => {
  const genderOptions = ["male", "female"];

  const relationshipStatusLabels: { [key: string]: string } = {
    single: "Độc thân",
    in_a_relationship: "Đang hẹn hò",
    engaged: "Đã đính hôn",
    married: "Đã kết hôn",
    complicated: "Phức tạp",
    separated: "Ly thân",
    divorced: "Đã ly hôn",
    widowed: "Goá",
  };
  
  const genderLabels = {
    male: "Nam",
    female: "Nữ",
  };
  
  const [formData, setFormData] = useState({
    bio: userProfile?.user.bio || "",
    birthday: userProfile?.user.birthday || "",
    phone_number: userProfile?.profile.phone_number || "",
    gender: userProfile?.user.gender || "",
    relationship_status: userProfile?.profile.relationship_status || "",
    location: userProfile?.profile.location || "",
    joined: userProfile?.profile.created_at || "",
    past_school: userProfile?.profile.past_school || "",
    current_school: userProfile?.profile.current_school || "",
    workplace: userProfile?.profile.workplace || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    axiosInstance.post(API_ENDPOINTS.PROFILE.BASE + API_ENDPOINTS.PROFILE.MY_PROFILE.UPDATE_ABOUT, formData)
      .then((res) => {
        const { user, profile } = res.data.data;
        setFormData({
            bio: user.bio || "",
            birthday: user.birthday || "",
            phone_number: profile.phone_number || "",
            gender: user.gender || "",
            relationship_status: profile.relationship_status || "",
            location: profile.location || "",
            joined: profile.created_at || "",
            past_school: profile.past_school || "",
            current_school: profile.current_school || "",
            workplace: profile.workplace || "",
          });
          onUpdateProfile({
            user: {
              ...user,
              bio: user.bio || "",
              birthday: user.birthday || "",
              gender: user.gender || "",
              created_at: user.created_at || "",
            },
            profile: {
              ...profile,
              relationship_status: profile.relationship_status || "",
              location: profile.location || "",
              created_at: profile.created_at || "",
              phone_number: profile.phone_number || "",
              past_school: profile.past_school || "",
              current_school: profile.current_school || "",
              workplace: profile.workplace || "",
            },
          });
      })
      .catch((err) => {
        console.log(err);
      });
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>{EditProfile}</ModalHeader>
      <ModalBody>
        <div className="edit-profile-sec">
          <div className="profile-wrap">
            <div className="edit-title">
              <div className="icon">
                <DynamicFeatherIcon
                  iconName="FileText"
                  className="iw-16 ih-16"
                />
              </div>
              <h5>Giới thiệu</h5>
            </div>
            <div className="edit-content">
              <textarea
                className="form-control"
                rows={3}
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Write something about yourself..."
              />
            </div>
          </div>

          <div className="profile-wrap">
            <div className="edit-title">
              <div className="icon">
                <DynamicFeatherIcon
                  iconName="Calendar"
                  className="iw-16 ih-16"
                />
              </div>
              <h5>Sinh nhật</h5>
            </div>
            <div className="edit-content">
              <input
                type="date"
                className="form-control"
                name="birthday"
                value={formData.birthday}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="profile-wrap">
            <div className="edit-title">
              <div className="icon">
                <DynamicFeatherIcon iconName="Phone" className="iw-16 ih-16" />
              </div>
              <h5>Số điện thoại</h5>
            </div>
            <div className="edit-content">
              <input
                type="tel"
                className="form-control"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="profile-wrap">
            <div className="edit-title">
              <div className="icon">
                <DynamicFeatherIcon iconName="User" className="iw-16 ih-16" />
              </div>
              <h5>Giới tính</h5>
            </div>
            <div className="edit-content">
              <div className="row">
                {Object.keys(genderLabels).map((gender, index) => (
                  <div className="form-check col-sm-6" key={gender}>
                    <label
                      className="form-check-label"
                      htmlFor={`gender${index}`}
                    >
                      <input
                        className="form-check-input radio_animated"
                        type="radio"
                        name="gender"
                        id={`gender${index}`}
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={handleInputChange}
                      />
                      {genderLabels[gender as keyof typeof genderLabels]}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="profile-wrap">
            <div className="edit-title">
              <div className="icon">
                <DynamicFeatherIcon iconName="Heart" className="iw-18 ih-18" />
              </div>
              <h5>Tình trạng mối quan hệ</h5>
            </div>
            <div className="edit-content">
              <div className="row">
                {Object.keys(relationshipStatusLabels).map((status, index) => (
                  <div className="form-check col-sm-6" key={status}>
                    <label
                      className="form-check-label"
                      htmlFor={`relationship${index}`}
                    >
                      <input
                        className="form-check-input radio_animated"
                        type="radio"
                        name="relationship_status"
                        id={`relationship${index}`}
                        value={status}
                        checked={formData.relationship_status === status}
                        onChange={handleInputChange}
                      />
                      {relationshipStatusLabels[status]}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="profile-wrap">
            <div className="edit-title">
              <div className="icon">
                <DynamicFeatherIcon iconName="MapPin" className="iw-18 ih-18" />
              </div>
              <h5>Location</h5>
            </div>
            <div className="edit-content">
              <input
                type="text"
                className="form-control"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter your location"
              />
            </div>
          </div>

          <div className="profile-wrap">
            <div className="edit-title">
              <div className="icon">
                <DynamicFeatherIcon iconName="MapPin" className="iw-18 ih-18" />
              </div>
              <h5>Đã từng học tại</h5>
            </div>
            <div className="edit-content">
              <input
                type="text"
                className="form-control"
                name="past_school"
                value={formData.past_school}
                onChange={handleInputChange}
                placeholder="Enter your past school"
              />
            </div>
          </div>

          <div className="profile-wrap">
            <div className="edit-title">
              <div className="icon">
                <DynamicFeatherIcon iconName="MapPin" className="iw-18 ih-18" />
              </div>
              <h5>Học tại</h5>
            </div>
            <div className="edit-content">
              <input
                type="text"
                className="form-control"
                name="current_school"
                value={formData.current_school}
                onChange={handleInputChange}
                placeholder="Enter your current school"
              />
            </div>
          </div>

          <div className="profile-wrap">
            <div className="edit-title">
              <div className="icon">
                <DynamicFeatherIcon iconName="MapPin" className="iw-18 ih-18" />
              </div>
              <h5>Làm việc tại</h5>
            </div>
            <div className="edit-content">
              <input
                type="text"
                className="form-control"
                name="workplace"
                value={formData.workplace}
                onChange={handleInputChange}
                placeholder="Enter your work place"
              />
            </div>
          </div>

          <div className="profile-wrap">
            <div className="edit-title">
              <div className="icon">
                <DynamicFeatherIcon iconName="Clock" className="iw-16 ih-16" />
              </div>
              <h5>Joined</h5>
            </div>
            <div className="edit-content">
              <input
                type="text"
                className="form-control"
                value={dayjs(formData.joined).format("DD/MM/YYYY")}
                readOnly
                disabled
              />
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
        <Button color="solid" onClick={handleSubmit}>
          Save Changes
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default PersonalInformationModal;
