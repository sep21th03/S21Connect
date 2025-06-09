import { Dispatch, SetStateAction } from "react";
import { Col, TabContent, TabPane } from "reactstrap";
import SettingHome from "./SettingHome";
import { Href, SettingMenu } from "../../utils/constant/index";
import GeneralSetting from "./GeneralSetting";
import AccountSetting from "./AccountSetting";
import PrivacySetting from "./PrivacySetting";
import SharingOptions from "./SharingOptions";
import Notification from "./Notification";
import { useSelector } from "react-redux";
import { RootState } from "@/redux-toolkit/store";

export interface NavBarInterFace {
  activeTab: number;
  setActiveTab: Dispatch<SetStateAction<number>>;
  showSideBar:boolean  
  setShowSideBar:Dispatch<SetStateAction<boolean>>
}

const NavBarTabContent: React.FC<NavBarInterFace> = ({ activeTab ,setShowSideBar }) => {
  const user = useSelector((state: RootState) => state.user.user);
  return (
    <Col xl="9" lg="8">
      <div className="d-lg-none d-block text-right mb-3">
        <a href={Href} className="btn btn-solid setting-menu" onClick={()=>setShowSideBar((prev)=>!prev)}>
          {SettingMenu}
        </a>
      </div>
      <TabContent activeTab={activeTab}>
        <TabPane tabId={1}>
          {user && <SettingHome user={user} />}
        </TabPane>
        <TabPane tabId={2}>
          {user && <GeneralSetting user={user} />}
        </TabPane>
        <TabPane tabId={3}>
          {user && <AccountSetting />}
        </TabPane>
        <TabPane tabId={4}>
          {user && <PrivacySetting />}
        </TabPane>
        <TabPane tabId={5}>
          {user && <Notification />}
        </TabPane>
        <TabPane tabId={6}>
          {user && <SharingOptions />}
        </TabPane>
      </TabContent>
    </Col>
  );
};

export default NavBarTabContent;
