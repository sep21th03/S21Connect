"use client";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button,
} from "reactstrap";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

const UserNotFound = () => {
  const router = useRouter();

  return (
    <Container fluid className={styles.container}>
      <Row className="w-100 justify-content-center">
        <Col md="8" lg="6" xl="5">
          <Card className={styles.card}>
            <CardBody className={styles.cardBody}>
              <div className={styles.image}>
                <Image
                  src="/assets/images/404.png"
                  alt="404"
                  width={300}
                  height={300}
                  className="img-fluid"
                />
              </div>
              <CardTitle tag="h2" className={styles.cardTitle}>
                Không tìm thấy người dùng
              </CardTitle>
              <CardText className={styles.cardText}>
                Người dùng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
              </CardText>
              <div className="d-flex justify-content-center gap-3">
                <Link href="/" passHref>
                  <Button color="primary" className={styles.button}>
                    Về trang chủ
                  </Button>
                </Link>
                <Button
                  color="secondary"
                  className={styles.button}
                  onClick={() => router.back()}
                >
                  Quay lại
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserNotFound;
