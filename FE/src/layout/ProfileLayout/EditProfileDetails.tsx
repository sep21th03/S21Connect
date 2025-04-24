import React, { useState } from "react";
import { UserEditInterFace } from "../LayoutTypes";
import { FormGroup, Input, Label } from "reactstrap";
import Switch from "react-switch"; // Import the Switch component
import { RelationshipStatus } from "@/utils/interfaces/user";

const EditProfileDetails = ({
  userProfile,
  onUpdateProfile,
}: UserEditInterFace) => {
  const [formData, setFormData] = useState({
    workplace: userProfile?.profile.workplace || "",
    current_school: userProfile?.profile.current_school || "",
    past_school: userProfile?.profile.past_school || "",
    relationship_status: userProfile?.profile.relationship_status || "",
    location: userProfile?.profile.location || "",
    phone_number: userProfile?.profile.phone_number || "",
    is_phone_number_visible:
      userProfile?.profile.is_phone_number_visible || false,
    is_location_visible: userProfile?.profile.is_location_visible || false,
    is_workplace_visible: userProfile?.profile.is_workplace_visible || false,
    is_school_visible: userProfile?.profile.is_school_visible || false,
    is_past_school_visible:
      userProfile?.profile.is_past_school_visible || false,
    is_relationship_status_visible:
      userProfile?.profile.is_relationship_status_visible || false,
  });

  const relationshipStatuses = [
    "single",
    "in_a_relationship",
    "engaged",
    "married",
    "complicated",
    "separated",
    "divorced",
    "widowed",
  ];

  // Handle editing for text fields
  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    // Update the profile with new data
    if (userProfile && onUpdateProfile) {
      const updatedProfile = {
        ...userProfile,
        profile: {
          ...userProfile.profile,
          [field]: value,
        },
      };
      onUpdateProfile(updatedProfile);
    }
  };

  // Handle toggle for visibility settings
  const handleToggleChange = (field: string) => {
    const updatedValue = !formData[field as keyof typeof formData];
    setFormData({ ...formData, [field]: updatedValue });

    // Update the profile with new visibility setting
    if (userProfile && onUpdateProfile) {
      const updatedProfile = {
        ...userProfile,
        profile: {
          ...userProfile.profile,
          [field]: updatedValue,
        },
      };
      onUpdateProfile(updatedProfile);
    }
  };

  // Handle relationship status change
  const handleRelationshipChange = (status: RelationshipStatus) => {
    setFormData({ ...formData, relationship_status: status });

    if (userProfile && onUpdateProfile) {
      const updatedProfile = {
        ...userProfile,
        profile: {
          ...userProfile.profile,
          relationship_status: status,
        },
      };
      onUpdateProfile(updatedProfile);
    }
  };

  return (
    <>
      <div className="profile-wrap">
        <div className="edit-title">
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-briefcase iw-16 ih-16"
            >
              <rect x={2} y={7} width={20} height={14} rx={2} ry={2} />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <h5>Nơi làm việc</h5>
          <div className="ms-auto d-flex align-items-center ">
          {/* {!formData.workplace && (
              <a href="#" className="btn btn-outline">
                + thêm nơi làm việc
              </a>
            )} */}
            <Switch
              checked={formData.is_workplace_visible}
              onChange={() => handleToggleChange("is_workplace_visible")}
              className="custom-switch me-3"
              height={20}
              width={40}
              uncheckedIcon={false}
              checkedIcon={false}
            />
            
          </div>
        </div>
        <div className="edit-content">
          <div className="input-group">
            <Input
              type="text"
              className="form-control"
              value={formData.workplace}
              onChange={(e) => handleInputChange("workplace", e.target.value)}
              placeholder="Thêm nơi làm việc"
            />
          </div>
        </div>
      </div>

      <div className="profile-wrap">
        <div className="edit-title">
          <div className="icon">
            <svg>
              <use
                className="fill-color"
                xlinkHref="../assets/svg/icons.svg#degree"
              />
            </svg>
          </div>
          <h5>Học tại</h5>
          <div className="ms-auto d-flex align-items-center">
          {/* {!formData.current_school && (
              <a href="#" className="btn btn-outline">
                + thêm học vấn
              </a>
            )} */}
            <Switch
              checked={formData.is_school_visible}
              onChange={() => handleToggleChange("is_school_visible")}
              className="custom-switch me-3"
              height={20}
              width={40}
              uncheckedIcon={false}
              checkedIcon={false}
            />
         
          </div>
        </div>
        <div className="edit-content">
          <div className="input-group">
            <Input
              type="text"
              className="form-control"
              value={formData.current_school}
              onChange={(e) =>
                handleInputChange("current_school", e.target.value)
              }
              placeholder="Thêm trường đang học"
            />
          </div>
        </div>
      </div>

      <div className="profile-wrap">
        <div className="edit-title">
          <div className="icon">
            <svg>
              <use
                className="fill-color"
                xlinkHref="../assets/svg/icons.svg#degree"
              />
            </svg>
          </div>
          <h5>Đã học tại</h5>
          <div className="ms-auto d-flex align-items-center">
          {/* {!formData.past_school && (
              <a href="#" className="btn btn-outline">
                + thêm học vấn
              </a>
            )} */}
            <Switch
              checked={formData.is_past_school_visible}
              onChange={() => handleToggleChange("is_past_school_visible")}
              className="custom-switch me-3"
              height={20}
              width={40}
              uncheckedIcon={false}
              checkedIcon={false}
            />
          
          </div>
        </div>
        <div className="edit-content">
          <div className="input-group">
            <Input
              type="text"
              className="form-control"
              value={formData.past_school}
              onChange={(e) => handleInputChange("past_school", e.target.value)}
              placeholder="Thêm trường đã học"
            />
          </div>
        </div>
      </div>

      <div className="profile-wrap">
        <div className="edit-title">
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-heart iw-18 ih-18"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h5>Tình trạng mối quan hệ</h5>
          <div className="ms-auto d-flex align-items-center">
            <Switch
              checked={formData.is_relationship_status_visible}
              onChange={() =>
                handleToggleChange("is_relationship_status_visible")
              }
              className="custom-switch me-3"
              height={20}
              width={40}
              uncheckedIcon={false}
              checkedIcon={false}
            />
          </div>
        </div>
        <div className="edit-content">
          <form className="edit-radio row">
            {relationshipStatuses.map((status, index) => (
              <div className="form-check col-sm-6" key={status}>
                <label
                  className="form-check-label"
                  htmlFor={`relationship${index}`}
                >
                  <input
                    className="form-check-input radio_animated"
                    type="radio"
                    name="relationshipStatus"
                    id={`relationship${index}`}
                    value={status}
                    checked={formData.relationship_status === status}
                    onChange={() =>
                      handleRelationshipChange(status as RelationshipStatus)
                    }
                  />
                  {status === "in_a_relationship"
                    ? "in a relationship"
                    : status}
                </label>
              </div>
            ))}
          </form>
        </div>
      </div>

      <div className="profile-wrap">
        <div className="edit-title">
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-map-pin iw-18 ih-18"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx={12} cy={10} r={3} />
            </svg>
          </div>
          <h5>Sống tại</h5>
          <div className="ms-auto d-flex align-items-center">
          {/* {!formData.location && (
              <a href="#" className="btn btn-outline">
                + thêm thành phố
              </a>
            )} */}
            <Switch
              checked={formData.is_location_visible}
              onChange={() => handleToggleChange("is_location_visible")}
              className="custom-switch me-3"
              height={20}
              width={40}
              uncheckedIcon={false}
              checkedIcon={false}
            />
           
          </div>
        </div>
        <div className="edit-content">
          <div className="input-group">
            <Input
              type="text"
              className="form-control"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Thêm địa điểm"
            />
          </div>
        </div>
      </div>

      <div className="profile-wrap">
        <div className="edit-title">
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-phone iw-18 ih-18"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <h5>Số điện thoại</h5>
          <div className="ms-auto d-flex align-items-center">
          {/* {!formData.phone_number && (
              <a href="#" className="btn btn-outline">
                + thêm số điện thoại
              </a>
            )} */}
            <Switch
              checked={formData.is_phone_number_visible}
              onChange={() => handleToggleChange("is_phone_number_visible")}
              className="custom-switch me-3"
              height={20}
              width={40}
              uncheckedIcon={false}
              checkedIcon={false}
            />
          </div>
        </div>
        <div className="edit-content">
          <div className="input-group">
            <Input
              type="text"
              className="form-control"
              value={formData.phone_number}
              onChange={(e) => handleInputChange("phone_number", e.target.value)}
              placeholder="Thêm số điện thoại"  
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfileDetails;
