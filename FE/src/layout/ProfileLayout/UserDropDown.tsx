import React, { FC, useState } from 'react'
import { UserDropDownInterFace } from '../LayoutTypes'
import { Dropdown, DropdownMenu, DropdownToggle, Input } from 'reactstrap'
import { ChoosePhoto, Href, RemovePhoto, SetPosition, UploadPhoto } from '../../utils/constant'
import DynamicFeatherIcon from '@/Common/DynamicFeatherIcon'
import UpdateImageModal from './UpdateImageModal'
import { useDispatch } from 'react-redux'
import { setBackgroundImage } from '@/redux-toolkit/reducers/LayoutSlice'



const UserDropDown:FC<UserDropDownInterFace> = ({dropDownOpen,toggleDropDown,isOwnProfile}) => {
    const dispatch = useDispatch();
    const [avatarModal, setAvatarModal] = useState(false);
    const [backgroundModal, setBackgroundModal] = useState(false);
    
    const toggleAvatarModal = () => setAvatarModal(!avatarModal);
    const toggleBackgroundModal = () => setBackgroundModal(!backgroundModal);
  
    const handleBackgroundUpdate = (newBackgroundUrl: string) => {
      dispatch(setBackgroundImage(newBackgroundUrl));
    };
  

  return (
    <>
    <Dropdown isOpen={dropDownOpen} toggle={toggleDropDown} className="setting-dropdown btn-group custom-dropdown arrow-none dropdown-sm">
        {isOwnProfile && (
        <DropdownToggle color="transparent">
          <a className="btn-white btn-cover" href="#">Chỉnh sửa</a>
        </DropdownToggle>
        )}
        <DropdownMenu>
          <ul>
            {/* <li onClick={toggleAvatarModal}>
              <a href={Href}><DynamicFeatherIcon iconName="Image" className="icon-font-light iw-16 ih-16"/>{ChoosePhoto}</a>
            </li> */}
            <li className="choose-file" onClick={toggleBackgroundModal}>
              <a href={Href}><DynamicFeatherIcon iconName="Upload" className="icon-font-light iw-16 ih-16"/>{UploadPhoto}</a>
              <Input type="file" />
            </li>
            <li>
              <a href={Href}><DynamicFeatherIcon iconName="Maximize" className="icon-font-light iw-16 ih-16"/>{SetPosition}</a>
            </li>
            <li>
              <a href={Href}><DynamicFeatherIcon iconName="Trash2" className="icon-font-light iw-16 ih-16"/>{RemovePhoto}</a>
            </li>
          </ul>
        </DropdownMenu>
      </Dropdown>
      {/* <UpdateImageModal isOpen={backgroundModal} toggle={toggleBackgroundModal} updateBackGround={handleBackgroundUpdate} isBackgroundImage={true} /> */}
      <UpdateImageModal isOpen={backgroundModal} toggle={toggleBackgroundModal} updateBackGround={handleBackgroundUpdate} isBackgroundImage={true} />
    </>
  )
}

export default UserDropDown