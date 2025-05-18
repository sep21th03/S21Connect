"use client";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Button,
} from "reactstrap";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css"; 
import Image403 from "../../../../public/assets/images/403.jpg";

const PermissionDenied = () => {
  const router = useRouter();

  return (
    <Container fluid className={styles.container}>
      <Row className="w-100 justify-content-center">
        <Col md="8" lg="6" xl="5">
          <Card className={styles.card}>
            <CardBody className={styles.cardBody}>
              <div className={styles.image}>
                <Image
                  src={Image403}
                  alt="403 Permission Denied"
                  width={300}
                  height={300}
                  className="img-fluid"
                />
              </div>
              <CardTitle tag="h2" className={styles.cardTitle}>
                Bạn không có quyền truy cập
              </CardTitle>
              <div className="d-flex justify-content-center gap-3">
                <Link href="/" passHref>
                  <Button color="primary" className={styles.button_primary}>
                    Về trang chủ
                  </Button>
                </Link>
                <Button
                  color="secondary"
                  className={styles.button_secondary}
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

export default PermissionDenied;
