import { SaveChanges, Href } from "../../utils/constant";
import { FormEvent } from "react";
import { Col, Input, Label, Row } from "reactstrap";
const SharingOptionsForm: React.FC = () => {
  return (
    <form className="theme-form form-sm" onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}>
      <Row>
        <div className="form-group col-sm-6">
          <Label className="title-lable">Cho phép người khác chia sẻ các bài viết của bạn lên trang cá nhân của họ</Label>
          <Row>
            <Col xs="12" className="form-check">
              <Label className="form-check-label font-weight-normal" htmlFor="exampleRadios1">
                <Input className="form-check-input radio_animated" type="radio" id="exampleRadios1" defaultChecked name="exampleRadios"/>allow
              </Label>
            </Col>
            <Col xs="12" className="form-check">
              <Label className="form-check-label font-weight-normal" htmlFor="exampleRadios2">
                <Input  className="form-check-input radio_animated"  type="radio"  id="exampleRadios2" name="exampleRadios"/>don't allow
              </Label>
            </Col>
          </Row>
        </div>
        <Col sm="6" className="form-group">
          <Label className="title-lable">Cho phép người khác trả lời tin nhắn</Label>
          <Row>
            <Col xs="12" className="form-check">
              <Label className="form-check-label font-weight-normal" htmlFor="exampleRadios3">
                <Input className="form-check-input radio_animated" name="radio_animated" type="radio" id="exampleRadios3" defaultChecked/>Bạn bè
              </Label>
            </Col>
            <Col xs="12" className="form-check">
              <Label className="form-check-label font-weight-normal" htmlFor="exampleRadios4">
                <Input className="form-check-input radio_animated" type="radio" name="radio_animated" id="exampleRadios4"/>Bạn bè
              </Label>
            </Col>
            <Col xs="12" className="form-check">
              <Label className="form-check-label font-weight-normal" htmlFor="exampleRadios6">
                <Input className="form-check-input radio_animated" type="radio" name="radio_animated" id="exampleRadios6"/>Tắt
              </Label>
            </Col>
          </Row>
        </Col>
        <Col xs="12" className="form-group">
          <Label className="title-lable">Lưu</Label>
          <Row>
            <Col md="6" className="form-group toggle-sec">
              <div className="button toggle-btn"><Input type="checkbox" className="checkbox" /><div className="knobs"><span /></div><div className="layer" /></div>
              <Label>Lưu vào thư viện<span>Lưu các bài viết vào thư viện</span></Label>
            </Col>
            <Col md="6" className="form-group toggle-sec">
              <div className="button toggle-btn"> <Input type="checkbox" defaultChecked className="checkbox" /> <div className="knobs"><span /></div> <div className="layer" /></div>
              <Label>Lưu vào lưu trữ<span>Lưu các bài viết vào lưu trữ</span></Label>
            </Col>
          </Row>
        </Col>
        <Col xs="12" className="form-group">
          <Label className="title-lable">Chia sẻ</Label>
          <Row>
            <Col md="6" className="form-group toggle-sec">
              <div className="button toggle-btn"><Input type="checkbox" defaultChecked className="checkbox" /><div className="knobs"><span /></div><div className="layer" /></div>
              <Label>Cho phép chia sẻ lại các bài viết lên trang cá nhân của họ</Label>
            </Col>
            <Col md="6" className="form-group toggle-sec col-md-6">
              <div className="button toggle-btn"><Input type="checkbox" className="checkbox" /><div className="knobs"><span /></div><div className="layer" /></div>
              <Label>Cho phép chia sẻ lên trang cá nhân của họ</Label>
            </Col>
            <Col md="6" className="form-group toggle-sec ">
              <div className="button toggle-btn"><Input type="checkbox" className="checkbox" />{" "}<div className="knobs"><span /></div>{" "}<div className="layer" /></div>
              <Label>Chia sẻ lên các ứng dụng mạng xã hội khác</Label>
            </Col>
          </Row>
        </Col>
        <Col sm="6" className="form-group">
          <Label className="title-lable">Cài đặt tin</Label>
          <Row>
            <Col xs="12" className="form-check">
              <Label className="form-check-label font-weight-normal" htmlFor="radio1">
                <Input className="form-check-input radio_animated" type="radio" id="radio1" defaultChecked/>Chỉ các bạn bè cụ thể
              </Label>
            </Col>
            <Col xs="12" className="form-check ">
              <Label className="form-check-label font-weight-normal" htmlFor="radio2">
                <Input className="form-check-input radio_animated" type="radio" id="radio2"/>Tất cả bạn bè
              </Label>
            </Col>
            <div className="form-check col-12">
              <Label className="form-check-label font-weight-normal" htmlFor="radio3">
                <Input className="form-check-input radio_animated" type="radio" id="radio3"/>Ẩn khỏi
              </Label>
            </div>
          </Row>
        </Col>
      </Row>
      <div className="text-right"><a href={Href} className="btn btn-solid">{SaveChanges}</a></div>
    </form>
  );
};
export default SharingOptionsForm;
