import { settingHomeData } from "@/Data/setting";
import { SvgPath } from "../../utils/constant";
import { Col, Row } from "reactstrap";
import { UserRedux } from "@/utils/interfaces/user";

const SettingHome: React.FC<{ user: UserRedux }> = ({ user }) => {
  return (
    <div className="setting-home">
      <div className="top-content">
        <h2>Chào mừng trở lại {user?.name}</h2>
        {/* <p> Lorem ipsum dolor, sit amet consectetur adipisicing elit. Pariatur repellat officiis, perspiciatis minus veniam ad sapiente nemo odit, corrupti iure earum, atque tenetur asperiores incidunt placeat eius voluptatem nesciunt in.</p> */}
      </div>
      <Row>
        {settingHomeData.map((data, index) => (
          <Col xl="4" sm="6" key={index}>
            <a className="detail-box">
              <img
                src={`${SvgPath}/setting/${data.image}.svg`}
                className="img-fluid blur-up lazyloaded"
                alt=""
              />
              <h3>{data.name}</h3>
              <p>{data.title}</p>
            </a>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SettingHome;
