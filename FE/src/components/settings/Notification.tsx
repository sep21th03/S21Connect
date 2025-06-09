import { Notifications } from "../../utils/constant";
import { FormEvent } from "react";
import { Col, Input, Label, Row } from "reactstrap";

const Notification: React.FC = () => {
  return (
    <div className="setting-wrapper">
      <div className="setting-title">
        <h3>{Notifications}</h3>
      </div>
      <div className="form-sec">
        <div>
          <form className="theme-form form-sm" onSubmit={(event: FormEvent<HTMLFormElement>) =>event.preventDefault()}>
            <Row>
              <Col xs="12"  className="form-group ">
                <Label>Bạn nhận được thông báo ở đâu?</Label>
              </Col>
              <Col md="6" className="form-group toggle-sec">
                <div className="button toggle-btn">
                  <Input type="checkbox" className="checkbox" />
                  <div className="knobs"><span /></div>
                  <div className="layer" />
                </div>
                <Label>Email <span>Nhận thông báo qua email</span></Label>
              </Col>
              <Col md="6" className="form-group toggle-sec">
                <div className="button toggle-btn">
                  <Input type="checkbox" defaultChecked className="checkbox" />
                  <div className="knobs"><span /></div>
                  <div className="layer" />
                </div>
                <Label>SMS<span>Nhận thông báo qua tin nhắn điện thoại</span></Label>
              </Col>
              <Col xs="12" className="form-group">
                <Label>Thông báo khác</Label>
              </Col>
              <Col md="6" className="form-group toggle-sec">
                <div className="button toggle-btn">
                  <Input type="checkbox" className="checkbox" />
                  <div className="knobs"><span /></div>
                  <div className="layer" />
                </div>
                <Label>Âm thanh<span>Bật/tắt âm thanh thông báo</span></Label>
              </Col>
              <Col md="6" className="form-group toggle-sec">
                <div className="button toggle-btn">
                  <Input defaultChecked type="checkbox" className="checkbox" />
                  <div className="knobs"><span /></div>
                  <div className="layer" />
                </div>
                <Label>Rung <span>Bật/tắt rung khi có thông báo</span></Label>
              </Col>
              <Col md="6" className="form-group toggle-sec">
                <div className="button toggle-btn">
                  <Input type="checkbox" className="checkbox" />
                  <div className="knobs"><span /></div>
                  <div className="layer" />
                </div>
                <Label>Yêu cầu kết bạn<span>Nhận thông báo khi có lời mời kết bạn</span></Label>
              </Col>
              <Col md="6" className="form-group toggle-sec">
                <div className="button toggle-btn">
                  <Input type="checkbox" className="checkbox" />
                  <div className="knobs"><span /></div>
                  <div className="layer" />
                </div>
                <Label>Tin nhắn<span>Nhận thông báo khi có tin nhắn</span></Label>
              </Col>
              <Col md="6" className="form-group toggle-sec ">
                <div className="button toggle-btn">
                  <Input type="checkbox" className="checkbox" />
                  <div className="knobs"><span /></div>
                  <div className="layer" />
                </div>
                <Label>Bình luận<span>Nhận thông báo khi có bình luận</span></Label>
              </Col>
            </Row>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Notification;
