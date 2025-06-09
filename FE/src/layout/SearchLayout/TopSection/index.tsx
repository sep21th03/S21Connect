import React from "react";
import CustomImage from "@/Common/CustomImage";
import { ImagePath } from "../../../utils/constant";
import { Col, Container, Input, Row } from "reactstrap";

const TopSection = () => {
  const images = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <section className="breadcrumb-section bg-size blur-up lazyloaded">
      <CustomImage
        src={`${ImagePath}/butterfly-bg.jpg`}
        className="img-fluid blur-up lazyload bg-img"
        alt=""
      />
      <div className="animation-emoji">
        <ul className="circles">
          {images.map((data) => (
            <li key={data}>
              <img
                src={`${ImagePath}/breadcrumb/${data}.png`}
                className="img-fluid blur-up lazyloaded"
                alt=""
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="help-search">
        <Container>
          <Row>
            <Col lg="6" md="8" xs="12" className="m-auto">
              <h2>chúng tôi có thể giúp gì cho bạn?</h2>
              <form
                onSubmit={(event: React.FormEvent<HTMLFormElement>) =>
                  event.preventDefault()
                }
              >
                <Input type="search" placeholder="Tìm kiếm điều gì đó ở đây..." />
                <span>chủ đề phổ biến: quyền riêng tư, bảo mật, hồ sơ</span>
              </form>
            </Col>
          </Row>
        </Container>
      </div>
    </section>
  );
};

export default TopSection;
