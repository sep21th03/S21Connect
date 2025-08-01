import CustomImage from "@/Common/CustomImage";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Birthday, BirthdayWish, EditProfile, Href, ImagePath, ViewProfile } from "../../../../utils/constant";
import Image from "next/image";
import { FC, FormEvent, useState } from "react";
import {Button,Dropdown,DropdownMenu,DropdownToggle,Input} from "reactstrap";
import { BirthdayReminderInterFace } from "../Style1Types";

const BirthdayReminder: FC<BirthdayReminderInterFace> = ({mainClass, userInforBirthday}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen((prevState) => !prevState);
  if (!userInforBirthday || userInforBirthday.length === 0) return null;

  const birthdayUser = userInforBirthday[0];

  const getGenderPronoun = (gender: string | undefined) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return "anh";
      case "female":
        return "cô";
      case "other":
        return "họ";
      default:
        return "họ"; 
    }
  };


  return (
    <div className={`birthday-section bg-size blur-up lazyloaded section-t-space ${mainClass?mainClass:""}`}> 
      <CustomImage className="img-fluid blur-up lazyload bg-img" src={`${ImagePath}/birthday.webp`}/>
      <div className="birthday-top">
        <div className="title">
          <h3>{Birthday} !!!!</h3>
          <h6>{BirthdayWish}</h6>
        </div>
        {/* <div className="setting">
          <div className="setting-btn light-btn">
            <a href={Href} className="d-flex">
              <DynamicFeatherIcon iconName="RotateCw" className="icon icon-light stroke-width-3 iw-11 ih-11"/>
            </a>
          </div>
          <div className="setting-btn light-btn setting-dropdown">
            <Dropdown isOpen={dropdownOpen} toggle={toggle} className="btn-group custom-dropdown arrow-none dropdown-sm">
              <DropdownToggle color="transparent">
                <a className="d-flex" href={Href}>
                  <DynamicFeatherIcon iconName="Sun" className="icon-light stroke-width-3 iw-12 ih-12"/>
                </a>
              </DropdownToggle>
              <DropdownMenu>
                  <ul>
                    <li>
                      <a href={Href}><DynamicFeatherIcon iconName="Edit" className="icon-font-light iw-16 ih-16"/>{EditProfile}</a>
                    </li>
                    <li>
                      <a href={Href}><DynamicFeatherIcon iconName="User" className="icon-font-light iw-16 ih-16"/>{ViewProfile}</a>
                    </li>
                  </ul>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div> */}
      </div>
      <div className="birthday-content">
        <div className="image-section">
          <div className="icon">
            <img src={`${ImagePath}/icon/cake.png`} className="img-fluid blur-up lazyloaded" alt="cake"/>
          </div>
          <div className="center-profile bg-size blur-up lazyloaded">
            {birthdayUser?.avatar && (
              <Image className="img-fluid lazyload bg-img rounded-circle" src={birthdayUser.avatar} alt={birthdayUser.first_name} width={100} height={100}/>
            )}
          </div>
          <div className="icon">
            <h5>20+</h5>
          </div>
        </div>
        <div className="details">
          <h3>{birthdayUser?.first_name} {birthdayUser?.last_name}</h3>
          <h6>{birthdayUser?.location ?? ""}</h6>
          <p> Gửi lời chúc đến {getGenderPronoun(birthdayUser?.gender ?? "")} ấy!</p>
          <form onSubmit={(event: FormEvent<HTMLFormElement>)=>event.preventDefault()}>
            <Input type="text" placeholder="Gửi lời chúc đến bạn bè" />
            <Button>
              <DynamicFeatherIcon iconName="ArrowRight" className="icon-light icon stroke-width-3 iw-13 ih-13"/>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BirthdayReminder;
