//@ts-nocheck
import { AccordionDummyText } from "../../utils/constant";
import { useState } from "react";
import { Accordion, Button, Card, CardBody, CardHeader, Collapse } from "reactstrap";

const ArticleAccordion: React.FC = () => {
  const [isOpen, setIsOpen] = useState<string | null>("1");
  const toggle = (id: string) =>
    isOpen === id ? setIsOpen(null) : setIsOpen(id);
  return (
    <Accordion open={"1"} className="theme-accordion accordion-sm">
      <Card>
        <CardHeader>
          <h2 className="mb-0">
            <Button className="btn-link btn-block text-left" onClick={() => toggle("1")}>
              Chọn tên người dùng mới
            </Button>
          </h2>
        </CardHeader>
        <Collapse isOpen={isOpen === "1"}>
          <CardBody>
            <p>
              Khi bạn tạo tài khoản S21connect, chúng tôi yêu cầu một số thông tin cá nhân. Bằng cách cung cấp thông tin chính xác, bạn có thể giúp giữ an toàn tài khoản của mình và làm cho dịch vụ của chúng tôi hữu ích hơn.
            </p>
          </CardBody> 
        </Collapse>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="mb-0">
            <Button className="btn-link btn-block text-left collapsed" onClick={() => toggle("2")}>
              Kiểm tra nếu bạn đã có tài khoản S21connect
            </Button>
          </h2>
        </CardHeader>
        <Collapse isOpen={isOpen === "2"}>
          <CardBody>
            <p>
              Khi bạn tạo tài khoản S21connect, chúng tôi yêu cầu một số thông tin cá nhân. Bằng cách cung cấp thông tin chính xác, bạn có thể giúp giữ an toàn tài khoản của mình và làm cho dịch vụ của chúng tôi hữu ích hơn.
            </p>
          </CardBody>
        </Collapse>
      </Card>
      <Card>
        <CardHeader>
          <h2 className="mb-0">
            <Button className="btn-link btn-block text-left collapsed" onClick={() => toggle("3")}>
              Kiểm tra nơi thông báo email được gửi
            </Button>
          </h2>
        </CardHeader>
        <Collapse isOpen={isOpen === "3"}>
          <CardBody>
            <p>
              Khi bạn tạo tài khoản S21connect, chúng tôi yêu cầu một số thông tin cá nhân. Bằng cách cung cấp thông tin chính xác, bạn có thể giúp giữ an toàn tài khoản của mình và làm cho dịch vụ của chúng tôi hữu ích hơn.
            </p>
          </CardBody>
        </Collapse>
      </Card>
    </Accordion>
  );
};

export default ArticleAccordion;
