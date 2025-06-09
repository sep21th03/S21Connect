import { PrivacySettings, SaveChanges } from "../../utils/constant";
import { FormEvent } from "react";
import { Col, Input, Row } from "reactstrap";
import { Href } from '../../utils/constant/index';

const PrivacySetting: React.FC = () => {
  return (
    <div className="setting-wrapper">
      <div className="setting-title">
        <h3>{PrivacySettings}</h3>
      </div>
      <div className="form-sec">
        <div>
          <form className="theme-form form-sm" onSubmit={(event: FormEvent<HTMLFormElement>) =>event.preventDefault()}>
            <Row>
              <Col xs="12" className="form-group">
                <label>Ai có thể xem bài viết của bạn?</label>
                <Input type="select">
                  <option value="">Tất cả</option>
                  <option>Bạn bè</option>
                  <option>Chỉ mình tôi</option>
                </Input>
              </Col>
              <div className="form-group col-12">
                <label>Ai có thể gửi lời mời kết bạn?</label>
                <Input type="select">
                  <option value="">Tất cả</option>
                  <option>Bạn bè</option>
                  <option>Chỉ mình tôi</option>
                </Input>
              </div>
              <div className="form-group col-12">
                <label>Ai có thể xem địa chỉ email của bạn?</label>
                <Input type="select">
                  <option>Tất cả</option>
                  <option>Bạn bè</option>
                  <option value="">Chỉ mình tôi</option>
                </Input>
              </div>
              <div className="form-group col-12">
                <label>Ai có thể xem số điện thoại của bạn?</label>
                <Input type="select">
                  <option>Tất cả</option>
                  <option>Bạn bè</option>
                  <option>Chỉ mình tôi</option>
                </Input>
              </div>
            </Row>
            <div className="text-right">
              <a href={Href} className="btn btn-solid">
                {SaveChanges}
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PrivacySetting;
