import {
  Messages,
  Subject,
  Submit,
  SvgPath,
  YourName,
} from "../../utils/constant";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { Button, Col, Container, Input, Label, Row } from "reactstrap";
import { EmailAddress } from "../../utils/constant/index";
import { settingService } from "@/service/settingService";
import { toast } from "react-toastify";

const ContactUS: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await settingService.contactUs(formData);
      toast.success(response.message);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  return (
    <section className="section-pb-space help-contact">
      <Container>
        <Row>
          <Col lg="6">
            <div className="intro-part">
              <div className="title">
                <h2>Đừng có lạ lẫm! liên hệ với chúng tôi</h2>
                <p>
                  Tìm kiếm điều gì khác? liên hệ với chúng tôi bằng cách điền
                  biểu mẫu này
                </p>
              </div>
              <div className="contact-img">
                <Image
                  height={261}
                  width={415}
                  src={`${SvgPath}/help-topics/contact.svg`}
                  className="img-fluid blur-up lazyloaded"
                  alt=""
                />
              </div>
            </div>
          </Col>
          <Col lg="6">
            <form className="theme-form row" onSubmit={handleSubmit}>
              <Col md="6" className="form-group mb-3">
                <Label>{YourName}</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Col>
              <Col md="6" className=" form-group mb-3">
                <Label>{EmailAddress}</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Col>
              <Col md="12" className="form-group mb-3">
                <Label>{Subject}</Label>
                <Input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </Col>
              <Col md="12" className="form-group mb-0">
                <Label className="d-block">{Messages}</Label>
                <Input
                  type="textarea"
                  rows={6}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                />
              </Col>
              <Col xs="12" className="mt-4 text-right">
                <Button color="solid" size="lg">
                  {Submit}
                </Button>
              </Col>
            </form>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ContactUS;
